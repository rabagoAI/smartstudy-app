#!/usr/bin/env python3
"""
set_admin_claim.py — Establece el custom claim 'admin: true' en Firebase Auth
para que el usuario pueda usar collectionGroup queries protegidas.

Uso:
    python scripts/set_admin_claim.py --email pacoalfair@hotmail.com
"""

import argparse
import os
import sys
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv

load_dotenv()

def main():
    parser = argparse.ArgumentParser(description='Set admin custom claim in Firebase Auth')
    parser.add_argument('--email', required=True, help='Email del usuario admin')
    args = parser.parse_args()

    cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'scripts/serviceAccountKey.json')
    if not os.path.exists(cred_path):
        print(f"❌ No se encontró serviceAccountKey.json en: {cred_path}")
        sys.exit(1)

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

    try:
        user = auth.get_user_by_email(args.email)
        auth.set_custom_user_claims(user.uid, {'admin': True})
        print(f"✅ Custom claim 'admin: true' establecido para {args.email}")
        print(f"   UID: {user.uid}")
        print()
        print("⚠️  IMPORTANTE: el usuario debe cerrar sesión y volver a entrar")
        print("   para que el nuevo token incluya el claim admin.")
    except auth.UserNotFoundError:
        print(f"❌ No se encontró ningún usuario con email: {args.email}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
