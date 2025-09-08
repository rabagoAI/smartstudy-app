import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../auth/Auth.css';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setSuccess('¡Registro exitoso! Por favor, inicia sesión.');
            navigate('/iniciar-sesion');
        } catch (error) {
            console.error("Error al registrar:", error.message);
            setError('Error al registrar. Por favor, revisa tus datos o inténtalo más tarde.');
        }
    };

    return (
        <section className="auth-form-container">
            <div className="auth-form-card">
                <h2>Registrarse</h2>
                <form onSubmit={handleRegister}>
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
                    <button type="submit" className="btn btn-primary">Registrarse</button>
                </form>
                <div className="auth-footer">
                    <span>¿Ya tienes una cuenta? <a href="/iniciar-sesion">Inicia Sesión</a></span>
                </div>
            </div>
        </section>
    );
}

export default RegisterPage;


