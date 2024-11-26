import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';

export const SendVerificationEmail = ({ email, onVerification }) => {
    const [verificationCode, setVerificationCode] = useState("");
    const [inputCode, setInputCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(0); // Inicialmente sem tempo (não exibe o contador)
    const [codeRequested, setCodeRequested] = useState(false); // Controle para exibir o contador somente após solicitação

    const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    const sendEmail = () => {
        const code = generateCode();
        setVerificationCode(code);

        const emailParams = {
            email: email,
            from_name: 'Chat App Verify',
            code: code,
        };

        emailjs
            .send('service_x96pjvw', 'template_tsuoxto', emailParams, 'VxpIynCC3_LfavJuD')
            .then(() => {
                toast.success('Um código de verificação foi enviado para ' + email + '.', { theme: 'dark' });
                setTimeLeft(5 * 60); // Reseta o tempo para 5 minutos
                setCodeRequested(true); // Marca que o código foi solicitado
            })
            .catch((error) => {
                console.error("Erro ao enviar email:", error);
                toast.error('Falha ao enviar o código de verificação.');
            });
    };

    const verifyCode = () => {
        onVerification()
        if (timeLeft <= 0) {
            toast.error('O código expirou. Solicite um novo código.', { theme: 'dark' });
        } else if (inputCode === verificationCode) {
            toast.success('Código verificado com sucesso!', { theme: 'dark' });
            onVerification(); // Notifica o componente pai que a verificação foi concluída
        } else {
            toast.error('Código inválido. Tente novamente.', { theme: 'dark' });
        }
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className='verify'>
            <p>Clique <span onClick={sendEmail}>aqui</span> para enviar um código de verificação para {email}.</p>
            {codeRequested && (
                timeLeft > 0 ? (
                    <p>Código expira em: <strong>{formatTime(timeLeft)}</strong></p>
                ) : (
                    <p style={{ color: 'red' }}>O código expirou. Solicite um novo código.</p>
                )
            )}
            <input
                type="text"
                placeholder="Digite o código recebido"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                disabled={!codeRequested} // Impede digitar antes de solicitar o código
            />
            <button className='button' onClick={verifyCode} disabled={!codeRequested}>
                Verificar Código
            </button>
        </div>
    );
};
