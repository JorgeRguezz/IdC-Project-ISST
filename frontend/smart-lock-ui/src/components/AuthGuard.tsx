import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type AuthGuardProps = {
    children: ReactNode;
    userType?: 'PROPIETARIO' | 'HUESPED';
};

const AuthGuard = ({ children, userType }: AuthGuardProps) => {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [hasCorrectType, setHasCorrectType] = useState<boolean | null>(null);

    useEffect(() => {
        // Verificar si el usuario está autenticado
        const usuarioString = localStorage.getItem('usuario');
        const isAuth = !!usuarioString;
        setIsAuthenticated(isAuth);

        // Si se especifica un tipo de usuario, verificar si el usuario actual tiene ese tipo
        if (userType && isAuth) {
            try {
                const usuario = JSON.parse(usuarioString!);
                // Convertir a mayúsculas para comparar
                const usuarioTipo = usuario.tipo.toUpperCase();
                setHasCorrectType(usuarioTipo === userType);

                console.log('Usuario tipo:', usuarioTipo, 'Tipo esperado:', userType);
            } catch (error) {
                console.error('Error al analizar usuario:', error);
                setHasCorrectType(false);
            }
        } else {
            setHasCorrectType(true);
        }
    }, [userType]);

    // Mientras se verifica la autenticación, no renderizar nada
    if (isAuthenticated === null || hasCorrectType === null) {
        return null;
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si se especificó un tipo de usuario y no coincide, redirigir a la página correspondiente
    if (userType && !hasCorrectType) {
        const usuario = JSON.parse(localStorage.getItem('usuario')!);
        const usuarioTipo = usuario.tipo.toUpperCase();
        const redirectPath = usuarioTipo === 'PROPIETARIO'
            ? '/propietario-dashboard'
            : '/huesped-dashboard';

        console.log('Redirigiendo a:', redirectPath, 'Tipo actual:', usuarioTipo);
        return <Navigate to={redirectPath} replace />;
    }

    // Si todo está bien, mostrar los hijos
    return <>{children}</>;
};

export default AuthGuard; 