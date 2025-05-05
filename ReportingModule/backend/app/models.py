#Database Table defining

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Table, JSON, func
from sqlalchemy.orm import relationship
from .database import Base
import datetime
from datetime import datetime, timezone

user_projects = Table(
    "user_projects",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("project_id", Integer, ForeignKey("test_projects.id"), primary_key=True)
)

class TestReport(Base):
    __tablename__ = "test_reports"

    id = Column(Integer, primary_key=True, index=True)
    test_name = Column(String, index=True)
    status = Column(String)
    execution_time = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    test_suite_id = Column(Integer, ForeignKey("test_suites.id"), nullable=True)
    test_project_id = Column(Integer, ForeignKey("test_projects.id"), nullable=True)

    steps = relationship("TestStep", back_populates="report", cascade="all, delete-orphan")
    test_suite = relationship("TestSuite", back_populates="test_reports")
    project = relationship("TestProject")
    comments = relationship("Comment", back_populates="test_report", cascade="all, delete-orphan")

class TestStep(Base):
    __tablename__ = "test_steps"

    id = Column(Integer, primary_key=True, index=True)
    test_report_id = Column(Integer, ForeignKey("test_reports.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_description = Column(String, nullable=False)
    step_status = Column(String, nullable=False)
    error_message = Column(String, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    report = relationship("TestReport", back_populates="steps")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    test_report_id = Column(Integer, ForeignKey("test_reports.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment_text = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User")
    test_report = relationship("TestReport", back_populates="comments")

class TestSuite(Base):
    __tablename__ = "test_suites"

    id = Column(Integer, primary_key=True, index=True)
    suite_name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    project_id = Column(Integer, ForeignKey("test_projects.id"), nullable=True)

    test_reports = relationship("TestReport", back_populates="test_suite")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")  # Values can be "user" or "admin"
    projects = relationship("TestProject", secondary=user_projects, back_populates="users")
    favorite_projects = relationship("FavoriteProject", back_populates="user")

class TestProject(Base):
    __tablename__ = "test_projects"
    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=func.now())
    users = relationship("User", secondary=user_projects, back_populates="projects")
    test_reports = relationship("TestReport", back_populates="project")
    favorited_by = relationship("FavoriteProject", back_populates="project")

class FavoriteProject(Base):
    __tablename__ = "favorite_projects"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("test_projects.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    user = relationship("User", back_populates="favorite_projects")
    project = relationship("TestProject", back_populates="favorited_by")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)
