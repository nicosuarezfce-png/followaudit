from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCrear, UsuarioRespuesta, LoginRespuesta
from app.auth import verificar_password, hashear_password, crear_token, get_usuario_actual

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=LoginRespuesta)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()

    if not usuario or not verificar_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )

    if usuario.activo != "S":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    token = crear_token({"sub": usuario.email, "rol": usuario.rol})

    return LoginRespuesta(
        access_token=token,
        token_type="bearer",
        usuario=UsuarioRespuesta.model_validate(usuario)
    )


@router.post("/usuarios", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def crear_usuario(datos: UsuarioCrear, db: Session = Depends(get_db)):
    """Crea un nuevo usuario (auditor o gerente). Solo para setup inicial."""
    if db.query(Usuario).filter(Usuario.email == datos.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con ese email"
        )

    nuevo = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        password_hash=hashear_password(datos.password),
        rol=datos.rol,
        area=datos.area
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/me", response_model=UsuarioRespuesta)
def mi_perfil(usuario_actual: Usuario = Depends(get_usuario_actual)):
    """Devuelve los datos del usuario autenticado."""
    return usuario_actual
