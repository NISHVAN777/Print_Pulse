from datetime import datetime


def stamp(now: datetime | None = None) -> str:
    moment = now or datetime.now()
    return moment.strftime("%Y-%m-%dT%H:%M:%S")
