import bcrypt

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    :param password: The plain text password.
    :return: The hashed password.
    """
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hashed version.
    :param password: The plain text password.
    :param hashed_password: The hashed password stored in the database.
    :return: True if passwords match, False otherwise.
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

# Example usage
if __name__ == "__main__":
    sample_password = "securepassword123"
    hashed = hash_password(sample_password)
    print(f"Hashed Password: {hashed}")

    # Verify password
    is_valid = verify_password(sample_password, hashed)
    print(f"Password is valid: {is_valid}")
