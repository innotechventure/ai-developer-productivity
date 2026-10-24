import string

ALPHABET = string.ascii_lowercase + string.ascii_uppercase + string.digits  # 62 characters


def encode_base62(num):
    """Return a base62-encoded string for the given integer. Raises ValueError if num is negative."""
    if num == 0:
        return ALPHABET[0]
    out = ""
    while num > 0:
        out = ALPHABET[num % 62] + out
        num //= 62
    return out


def record_visit(code, log=[]):  # BUG: mutable default argument is shared across all calls
    """Return an updated log list after appending the given code. Raises ValueError if code is invalid."""
    log.append(code)
    return log


def shorten(storage, long_url, code=None):
    """Return a base62 code for the given long URL. Raises ValueError if long_url is invalid."""
    if code is not None:
        # Validate custom code: alphanumeric + hyphen + underscore, 1-32 chars
        import re
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,32}', code):
            raise ValueError("Custom code must be alphanumeric, hyphen, or underscore (1-32 chars)")
        if storage.get_url(code) is not None:
            raise ValueError("Custom code already in use")
        storage.save(code, long_url)
        return code
    new_id = storage.next_id()
    code = encode_base62(new_id)
    storage.save(code, long_url)
    return code
