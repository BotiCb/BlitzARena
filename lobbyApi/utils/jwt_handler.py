from datetime import datetime, timedelta
from jose import jwt, JWTError
from config import JWT_SECRET, JWT_ALGORITHM
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


# Generate JWT Token
def create_jwt(expires_delta: timedelta = timedelta(seconds=15)):

    expire = datetime.utcnow() + expires_delta
    return jwt.encode({"exp": expire, "service": "lobbyApi"}, JWT_SECRET, algorithm=JWT_ALGORITHM)


# Verify JWT Token
def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        # Decode the token with proper validation
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Check for expiration
        if "exp" in payload and datetime.utcfromtimestamp(payload["exp"]) < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Token has expired")

        # You can also check for other claims if necessary (e.g., audience, issuer)
        if "service" not in payload or payload["service"] != "nestJs":
            raise HTTPException(status_code=401, detail="Invalid service claim")

        return payload  # Return the decoded payload (or more custom logic)

    except JWTError as e:
        print(f"JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token") from e
