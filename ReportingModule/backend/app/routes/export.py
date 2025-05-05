#Export functionality (including Send Grid API for emails)

import os
from datetime import datetime
from io import BytesIO
import base64
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session, joinedload
from reportlab.lib.pagesizes import letter
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from fastapi.encoders import jsonable_encoder
from typing import Optional
from ..database import get_db
from .. import models
from ..utils.utils import strip_html_tags
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

def send_email_with_attachment(recipient: str, subject: str, content: str, attachment_bytes: bytes):

    """Sends an email with test report attached (PDF) using SendGrid"""

    message = Mail(
        from_email=os.getenv("EMAIL_SENDER", "infusetestreportingsystem@gmail.com"),
        to_emails=recipient,
        subject=subject,
        html_content=content
    )
    encoded_file = base64.b64encode(attachment_bytes).decode()
    attachedFile = Attachment(
        FileContent(encoded_file),
        FileName("test_report.pdf"),
        FileType("application/pdf"),
        Disposition("attachment")
    )
    message.attachment = attachedFile
    try:
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        response = sg.send(message)
        print("Email sent. Status Code:", response.status_code)
    except Exception as e:
        print("SendGrid Error:", e)
        raise HTTPException(status_code=500, detail="Failed to send email")

router = APIRouter()

@router.get("/")
def export_report(
    format: str = Query("json", description="Export format: json or pdf OR EMAIL"),
    detailed: bool =Query(False, description="Include detailed test step data"),
    suite_id: int = Query(None, description="Filter by test suite ID"),
    test_id: Optional[int] = Query(None, description="Retrieve test reports with id >= this value"),
    test_name: str = Query(None, description="Filter by test name"),
    status: str = Query(None, description="Filter by test status (PASS/FAIL)"),
    start_date: str = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    recipient: str = Query(None, description="Recipient email for email export"),
    db: Session = Depends(get_db)
):
    """
    Exports test reports in the specified format:
      JSON: Returns a JSON response.
      PDF: Returns a downloadable PDF file.
      Email: Sends the report as a PDF attachment via email.
    """

    query = db.query(models.TestReport).options(joinedload(models.TestReport.steps))

    if suite_id is not None:
        query = query.filter(models.TestReport.test_suite_id == suite_id)
    if test_name:
        query = query.filter(models.TestReport.test_name.ilike(f"%{test_name}%"))
    if status:
        query = query.filter(models.TestReport.status == status.upper())
    if start_date and end_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(models.TestReport.timestamp.between(start_dt, end_dt))
        except ValueError:
            return JSONResponse(
                content={"error": "Date format must be YYYY-MM-DD."},
                status_code=400
            )
    if test_id is not None:
        query = query.filter(models.TestReport.id == test_id)

    # Retrieve all test reports
    reports = query.all()
    reports_data = [jsonable_encoder(report) for report in reports]

    # Remove detailed steps data if not requested
    if not detailed:
        for report in reports_data:
            report.pop("steps", None)

    if format.lower() == "json":
        return JSONResponse(content=reports_data)

    elif format.lower() in ["pdf", "email"]:
        """ Styling of the PDF is defined in here"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.5 * inch,
            leftMargin=0.5 * inch,
            topMargin=0.5 * inch,
            bottomMargin=0.5 * inch,
        )

        story = []
        styles = getSampleStyleSheet()

        table_para_style = ParagraphStyle(
            name="TableCellStyle",
            parent=styles["Normal"],
            fontSize=8,
            leading=10,
        )

        title_paragraph = Paragraph("<b style='font-size:14pt'>Test Reports</b>", styles["Title"])
        story.append(title_paragraph)
        story.append(Spacer(1, 0.25 * inch))

        for idx, report in enumerate(reports_data, start=1):
            test_name = report.get("test_name", "Untitled Test")
            status = report.get("status", "UNKNOWN")
            exec_time = report.get("execution_time", "N/A")
            timestamp_raw = report.get("timestamp", "")
            suite_id = report.get("test_suite_id", "")

            try:
                dt_object = datetime.fromisoformat(timestamp_raw)
                timestamp = dt_object.strftime("%d/%m/%Y %H:%M:%S")
            except Exception as e:
                timestamp = timestamp_raw

            header_html = f"""
            <b>Test #{idx}</b><br/>
            <b>Name:</b> {test_name}<br/>
            <b>Status:</b> {status}<br/>
            <b>Execution Time:</b> {exec_time}s<br/>
            <b>Timestamp:</b> {timestamp}<br/>
            <b>Suite ID:</b> {suite_id}
            """
            header_paragraph = Paragraph(header_html, styles["Normal"])
            story.append(header_paragraph)
            story.append(Spacer(1, 0.15 * inch))

            # If detailed, show steps in a styled table
            if detailed and "steps" in report and report["steps"]:
                step_data = [["Step #", "Description", "Status", "Message", "Timestamp"]]

                for step in report["steps"]:
                    # Convert each field to a Paragraph so it wraps within the column:
                    step_data.append([
                        Paragraph(str(step.get("step_number", "")), table_para_style),
                        Paragraph(str(step.get("step_description", "")), table_para_style),
                        Paragraph(str(step.get("step_status", "")), table_para_style),
                        Paragraph(strip_html_tags(str(step.get("error_message", ""))), table_para_style),
                        Paragraph(str(step.get("timestamp", "")), table_para_style),
                    ])

                col_widths = [
                    0.6 * inch,  # Step #
                    1.5 * inch,  # Description
                    0.9 * inch,  # Status
                    3.0 * inch,  # Message
                    1.4 * inch,  # Timestamp
                ]
                step_table = Table(step_data, colWidths=col_widths)

                table_style = TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                ])
                step_table.setStyle(table_style)

                story.append(step_table)
                story.append(Spacer(1, 0.25 * inch))
            else:
                story.append(Spacer(1, 0.15 * inch))

        doc.build(story)
        buffer.seek(0)

        if format.lower() == "pdf":
            return StreamingResponse(
                buffer,
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=reports.pdf"}
            )
        elif format.lower() == "email":
            # Convert the buffer to bytes, attach to email
            if not recipient:
                return JSONResponse(
                    content={"error": "Recipient email is required for email export."},
                    status_code=400
                )
            pdf_data = buffer.getvalue()
            send_email_with_attachment(
                recipient=recipient,
                subject="Test Report",
                content="<p>Please find attached your test report.</p>",
                attachment_bytes=pdf_data
            )
            return JSONResponse(content={"message": "Email sent successfully."})

    else:
        return JSONResponse(
            content={"error": "Invalid format. Supported formats: json, pdf, email."},
            status_code=400
        )
