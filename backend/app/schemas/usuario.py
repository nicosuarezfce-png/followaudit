from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.usuario import RolUsuario, AreaEmpresa


class UsuarioCrear(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol: RolUsuario
    area: Optional[AreaEmpresa] = None


class UsuarioRespuesta(BaseModel):
    id: int
    nombre: str
    email: str
    rol: RolUsuario
    area: Optional[AreaEmpresa] = None

    model_config = {"from_attributes": True}


class LoginRespuesta(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioRespuesta
