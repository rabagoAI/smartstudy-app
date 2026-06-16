#!/usr/bin/env python3
"""
auditar_admin.py — Audita privilegios en Firebase tras el fix SEC-12.

Antes de SEC-12 (2026-06-12) las reglas de Firestore tenían `isAdmin()` con un
`|| true` y los campos privilegiados no estaban bloqueados, así que cualquier
usuario pudo haberse auto-asignado `admin: true` o `premium: true` desde el
cliente. Este script lista, vía Admin SDK (no evadible):

  1. Usuarios con `admin == true` en su documento de Firestore.
  2. Usuarios con el custom claim `admin: true` en Firebase Auth.
  3. Usuarios con `premium == true` SIN `subscriptionId` (sospechoso: el premium
     legítimo lo escribe solo el webhook de Stripe, que siempre deja subscriptionId).

Solo lee; no modifica nada. Para revocar un admin ilegítimo:
  - Campo Firestore: editar el doc users/{uid} y poner admin=false.
  - Custom claim:  python scripts/set_admin_claim.py  (o revocar con un script análogo).

Uso (desde la raíz del repo):
    python scripts/auditar_admin.py
"""

import os
import sys

import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()

try:
    from google.cloud.firestore_v1.base_query import FieldFilter
    _HAS_FIELD_FILTER = True
except ImportError:
    _HAS_FIELD_FILTER = False


def _where(query, field, op, value):
    """where compatible: usa FieldFilter si está disponible (evita el warning)."""
    if _HAS_FIELD_FILTER:
        return query.where(filter=FieldFilter(field, op, value))
    return query.where(field, op, value)


def init_firebase():
    cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'scripts/serviceAccountKey.json')
    if not os.path.exists(cred_path):
        print(f"❌ No se encontró serviceAccountKey.json en: {cred_path}")
        print("   Ejecuta el script desde la raíz del repo o define FIREBASE_CREDENTIALS_PATH.")
        sys.exit(1)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(cred_path))


def auditar_admin_firestore(db):
    print("\n" + "═" * 60)
    print("  1) Usuarios con admin == true en Firestore")
    print("═" * 60)
    docs = list(_where(db.collection('users'), 'admin', '==', True).stream())
    if not docs:
        print("  ✅ Ninguno. (Solo el Admin SDK debería poder ponerlo.)")
        return
    for d in docs:
        data = d.to_dict()
        print(f"  ⚠️  {d.id}  email={data.get('email', '?')}  plan={data.get('plan', '?')}")
    print(f"\n  → {len(docs)} usuario(s) con admin=true. Revisa que sean legítimos.")


def auditar_claims_auth():
    print("\n" + "═" * 60)
    print("  2) Usuarios con custom claim admin: true en Firebase Auth")
    print("═" * 60)
    encontrados = 0
    page = auth.list_users()
    while page:
        for user in page.users:
            claims = user.custom_claims or {}
            if claims.get('admin') is True:
                encontrados += 1
                print(f"  🔑 {user.uid}  email={user.email}")
        page = page.get_next_page()
    if encontrados == 0:
        print("  ✅ Ningún usuario tiene el custom claim admin.")
    else:
        print(f"\n  → {encontrados} usuario(s) con claim admin. Confirma que correspondan a admins reales.")


def auditar_premium_sospechoso(db):
    print("\n" + "═" * 60)
    print("  3) Usuarios premium == true SIN subscriptionId (sospechoso)")
    print("═" * 60)
    docs = list(_where(db.collection('users'), 'premium', '==', True).stream())
    sospechosos = []
    for d in docs:
        data = d.to_dict()
        if not data.get('subscriptionId') and not data.get('stripeCustomerId'):
            sospechosos.append((d.id, data))
    print(f"  ℹ️  Total premium=true: {len(docs)}")
    if not sospechosos:
        print("  ✅ Todos los premium tienen subscriptionId/stripeCustomerId (vía webhook).")
        return
    for uid, data in sospechosos:
        print(f"  ⚠️  {uid}  email={data.get('email', '?')}  status={data.get('subscriptionStatus', '?')}")
    print(f"\n  → {len(sospechosos)} premium sin rastro de Stripe. Posible auto-asignación previa al fix.")


def main():
    init_firebase()
    db = firestore.client()
    print("\n🔍 Auditoría de privilegios SmartStudIA (solo lectura)")
    auditar_admin_firestore(db)
    auditar_claims_auth()
    auditar_premium_sospechoso(db)
    print("\n" + "═" * 60)
    print("  Auditoría completada. Nada fue modificado.")
    print("═" * 60 + "\n")


if __name__ == '__main__':
    main()
