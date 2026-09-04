from asteval import Interpreter


_aeval = Interpreter()


def calculate(expression: str) -> dict:
    """Safely evaluate a mathematical expression.

    Supports: arithmetic, powers, sqrt, sin, cos, tan, log, pi, e, etc.
    Does NOT support arbitrary Python code execution.
    """
    try:
        result = _aeval(expression)
        if _aeval.error:
            errors = "; ".join(str(e.get_error()[1]) for e in _aeval.error)
            _aeval.error = []
            return {"expression": expression, "error": errors}
        return {"expression": expression, "result": str(result)}
    except Exception as e:
        return {"expression": expression, "error": str(e)}
