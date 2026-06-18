from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
import os

SECRET_KEY = os.getenv("SECRET_KEY", "followaudit-dev-secret-key-cambiar-en-produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verificar_password(password_plano: str, password_hash: str) -> bool:
    return pwd_context.verify(password_plano, password_hash)


def hashear_password(password: str) -> str:
    return pwd_context.hash(password)


def crear_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = data.copy()
    expira = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload.update({"exp": expira})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    credenciales_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credenciales_error
    except JWTError:
        raise credenciales_error

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None or usuario.activo != "S":
        raise credenciales_error
    return usuario


def require_rol(*roles):
    """Decorador para restringir endpoints por rol."""
    def verificar(usuario: Usuario = Depends(get_usuario_actual)):
        if usuario.rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso restringido. Rol requerido: {', '.join(roles)}"
            )
        return usuario
    return verificar
