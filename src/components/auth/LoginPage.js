import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../auth/Auth.css';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccess('¡Inicio de sesión exitoso!');
            navigate('/');
        } catch (error) {
            console.error("Error al iniciar sesión:", error.message);
            setError('Error al iniciar sesión. Por favor, revisa tu email y contraseña.');
        }
    };

    return (
        <section className="auth-form-container">
            <div className="auth-form-card">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
                </form>
                <div className="auth-footer">
                    <span>¿No tienes una cuenta? <a href="/registrarse">Regístrate</a></span>
                </div>
            </div>
        </section>
    );
}

export default LoginPage;



