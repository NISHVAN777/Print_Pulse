"""Desk seed. Inserted once, when the SQLite file is still empty."""

import json

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models.tables import Mention, Source

SOURCES = [
    ("src-jagran", "Dainik Jagran", "Hindi", "Lucknow / Delhi", "epaper", "epaper.jagran.example/city", "Daily · 5:40 AM", "connected", "2026-09-23T05:58:00", 18, True),
    ("src-dinamalar", "Dinamalar", "Tamil", "Chennai", "email-clipping", "inbox · chennai-bureau@printpulse.example", "On arrival", "scanning", "2026-09-23T06:11:00", 4, True),
    ("src-eenadu", "Eenadu", "Telugu", "Hyderabad", "epaper", "epaper.eenadu.example", "Daily · 5:45 AM", "connected", "2026-09-23T05:56:00", 16, True),
    ("src-mt", "Maharashtra Times", "Marathi", "Mumbai", "epaper", "epaper.maharashtratimes.example", "Daily · 5:50 AM", "connected", "2026-09-23T06:01:00", 14, True),
    ("src-abp", "Anandabazar Patrika", "Bengali", "Kolkata", "epaper", "epaper.anandabazar.example", "Daily · 5:50 AM", "connected", "2026-09-23T06:02:00", 12, True),
    ("src-hindu", "The Hindu", "English", "Chennai", "epaper", "epaper.thehindu.example", "Daily · 6:00 AM", "connected", "2026-09-23T06:08:00", 20, True),
    ("src-dinakaran", "Dinakaran", "Tamil", "Madurai", "epaper", "epaper.dinakaran.example", "Daily · 5:55 AM", "attention", "2026-09-23T06:04:00", 9, True),
    ("src-patrika", "Rajasthan Patrika", "Hindi", "Jaipur", "epaper", "epaper.patrika.example", "Daily · 5:50 AM", "connected", "2026-09-23T05:59:00", 15, True),
    ("src-samachar", "Gujarat Samachar", "Gujarati", "Ahmedabad", "epaper", "epaper.gujaratsamachar.example", "Daily · 5:45 AM", "paused", "2026-09-22T05:52:00", 0, False),
    ("src-manorama", "Malayala Manorama", "Malayalam", "Kochi", "epaper", "epaper.manorama.example", "Daily · 5:40 AM", "connected", "2026-09-23T05:57:00", 11, True),
]


def seed_if_empty(db: Session) -> None:
    existing = db.scalar(select(func.count()).select_from(Source)) or 0
    if existing:
        return
    for row in SOURCES:
        db.add(
            Source(
                id=row[0],
                publication=row[1],
                language=row[2],
                city=row[3],
                kind=row[4],
                url=row[5],
                schedule=row[6],
                status=row[7],
                last_fetch=row[8],
                pages_today=row[9],
                enabled=row[10],
            )
        )
    for mention in _mentions():
        db.add(mention)
    db.commit()


def _mentions() -> list[Mention]:
    shared = {
        "brand": "PayU",
        "sample_trace": False,
        "file_name": None,
        "channels_json": json.dumps(["whatsapp", "slack"]),
        "keywords_json": json.dumps(["PayU"]),
    }
    return [
        Mention(
            id="dj-2309-07",
            page_id="page_dj_20260923_p07",
            ocr_id="ocr_dj_p07_c2",
            translation_id="tr_dj_p07_en",
            alert_id="alert_441",
            publication="Dainik Jagran",
            masthead="Dainik Jagran",
            city="Lucknow",
            language="Hindi",
            native_name="Hindi",
            sentiment="negative",
            confidence=91,
            review_flag=None,
            headline="RBI asks PayU to simplify its structure and reapply for a PA licence",
            native_headline="PayU must reapply for a payment aggregator licence",
            summary="City edition reports that new merchant onboarding is paused in Uttar Pradesh while PayU reworks its corporate structure.",
            translation="Lucknow. The Reserve Bank of India has asked PayU to simplify its corporate structure and submit a fresh application for a payment aggregator licence. New online merchant onboarding is paused. Existing merchants continue to receive settlements.",
            ocr_text="Lucknow. Sample OCR for the Dainik Jagran city page. A live read would replace this with the Hindi scan.",
            page_number=7,
            edition="City",
            column_name="Business · column 2",
            published_at="2026-09-23T06:05:00",
            detected_at="2026-09-23T06:12:00",
            latency_minutes=7,
            source_kind="epaper",
            **shared,
        ),
        Mention(
            id="dml-2309-04",
            page_id="page_dml_20260923_p04",
            ocr_id="ocr_dml_p04_c1",
            translation_id="tr_dml_p04_en",
            alert_id="alert_442",
            publication="Dinamalar",
            masthead="Dinamalar",
            city="Chennai",
            language="Tamil",
            native_name="Tamil",
            sentiment="negative",
            confidence=86,
            review_flag="Person name in paragraph 2 scored 0.62. Left untranslated and flagged for review.",
            headline="Merchants report PayU refunds held after festival orders",
            native_headline="PayU refunds delayed after festival orders",
            summary="A Chennai bureau clipping. Retailers say settlement links did not open, and two refunds are still pending.",
            translation="Chennai. Several retail merchants say PayU has held festival-season payments. Existing merchants continue to be served. One complainant name was unclear on the scan and is withheld.",
            ocr_text="Chennai. Sample OCR for the Dinamalar clipping. A live read would replace this with the Tamil scan.",
            page_number=4,
            edition="City",
            column_name="Trade · column 1",
            published_at="2026-09-23T06:05:00",
            detected_at="2026-09-23T06:18:00",
            latency_minutes=13,
            source_kind="email-clipping",
            **{
                **shared,
                "channels_json": json.dumps(["whatsapp", "slack", "email"]),
                "keywords_json": json.dumps(["PayU", "refund"]),
            },
        ),
        Mention(
            id="een-2309-02",
            page_id="page_een_20260923_p02",
            ocr_id="ocr_een_p02_c3",
            translation_id="tr_een_p02_en",
            alert_id="alert_443",
            publication="Eenadu",
            masthead="Eenadu",
            city="Hyderabad",
            language="Telugu",
            native_name="Telugu",
            sentiment="positive",
            confidence=95,
            review_flag=None,
            headline="Hyderabad merchants welcome faster PayU UPI settlements",
            native_headline="Merchants say PayU UPI settlement is faster",
            summary="Kirana and pharmacy owners say same-day UPI settlement through PayU helped them restock before the weekend.",
            translation="Hyderabad. Small merchants in Kukatpally and Ameerpet said PayU UPI settlement is now reaching their accounts the same day. No complaint was recorded.",
            ocr_text="Hyderabad. Sample OCR for the Eenadu city page. A live read would replace this with the Telugu scan.",
            page_number=2,
            edition="City",
            column_name="Markets · column 3",
            published_at="2026-09-23T06:02:00",
            detected_at="2026-09-23T06:09:00",
            latency_minutes=7,
            source_kind="epaper",
            **{
                **shared,
                "channels_json": json.dumps(["slack"]),
                "keywords_json": json.dumps(["PayU", "UPI settlement"]),
            },
        ),
        Mention(
            id="mt-2309-11",
            page_id="page_mt_20260923_p11",
            ocr_id="ocr_mt_p11_c2",
            translation_id="tr_mt_p11_en",
            alert_id="alert_444",
            publication="Maharashtra Times",
            masthead="Maharashtra Times",
            city="Mumbai",
            language="Marathi",
            native_name="Marathi",
            sentiment="neutral",
            confidence=93,
            review_flag=None,
            headline="Explainer: what PayU's payment aggregator reapplication means",
            native_headline="Why PayU has to file the licence application again",
            summary="A factual explainer. Names PayU alongside other aggregators asked to tidy corporate structures.",
            translation="Mumbai. A payment aggregator licence lets a firm onboard merchants and move customer funds. The Reserve Bank asked PayU to simplify its group structure and file again. Existing merchants were not switched off.",
            ocr_text="Mumbai. Sample OCR for the Maharashtra Times explainer. A live read would replace this with the Marathi scan.",
            page_number=11,
            edition="Main",
            column_name="Explainer · column 2",
            published_at="2026-09-23T06:05:00",
            detected_at="2026-09-23T06:21:00",
            latency_minutes=16,
            source_kind="epaper",
            **shared,
        ),
    ]
