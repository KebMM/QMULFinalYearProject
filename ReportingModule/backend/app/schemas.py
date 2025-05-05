# Schemas created

from pydantic import BaseModel, field_validator, ConfigDict, Field
from datetime import datetime
from typing import List, Optional, Dict

# Schema for creating an individual test step
class TestStepCreate(BaseModel):
    step_number: int
    step_description: str
    step_status: str
    error_message: Optional[str] = None
    timestamp: datetime

# Schema for returning an individual test step (used when retrieving data)
class TestStepResponse(TestStepCreate):
    id: int

    class Config:
        orm_mode = True

# Schema for creating a test report (when submitting test results)
class TestResultCreate(BaseModel):
    test_name: str
    status: str
    execution_time: float
    timestamp: datetime
    steps: List[TestStepCreate]
    test_suite_id: Optional[int]
    test_suite_name: Optional[str] = None
    test_project_id: Optional[int] = None

# Schema for retrieving a test report
class TestReportResponse(BaseModel):
    id: int
    test_name: str
    status: str
    execution_time: float
    timestamp: datetime
    steps: List[TestStepResponse]
    test_suite_id: Optional[int]
    test_suite_name: Optional[str] = None
    test_project_id: Optional[int] = None

    class Config:
        orm_mode = True

# Schema for creating a test suite
class TestSuiteCreate(BaseModel):
    suite_name: str
    project_id: Optional[int] = None

# Schema for returning a test suite
class TestSuiteResponse(TestSuiteCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Schema for showing a project in the user's project list
class ProjectInUserResponse(BaseModel):
    id: int
    project_name: str

    model_config = ConfigDict(from_attributes=True)

# Base schema for user information
class UserBase(BaseModel):
    username: str

# Schema for creating a new user
class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user"  # Default to "user" if not provided

# Schema for returning user information (including projects)
class UserResponse(UserBase):
    id: int
    role: str
    projects: List[ProjectInUserResponse] = Field(default_factory=list)

    class Config:
        orm_mode = True

# Base schema for test project information
class TestProjectBase(BaseModel):
    project_name: str

# Schema for creating a test project
class TestProjectCreate(TestProjectBase):
    pass

# Schema for returning test project information
class TestProjectResponse(TestProjectBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Schema aggregating stats for a test suite
class TestSuiteAggregationResponse(BaseModel):
    suite_name: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    pass_rate: float
    avg_execution_time: float

    class Config:
        orm_mode = True

# Schema representing error metrics data for visualisations
class ErrorMetricsResponse(BaseModel):
    labels: List[str]
    values: List[int]

# Schema for marking a project as a favourite
class FavoriteProjectCreate(BaseModel):
    project_id: int

# Schema for returning favourite project information
class FavoriteProjectResponse(BaseModel):
    id: int
    user_id: int
    project_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Schema for updating a user's role
class UserRoleUpdate(BaseModel):
    role: str

    @field_validator("role")
    def validate_role(cls, value: str) -> str:
        allowed_roles = ["admin", "user"]
        if value.lower() not in allowed_roles:
            raise ValueError('Role must be either "admin" or "user".')
        return value.lower()

    model_config = ConfigDict(from_attributes=True)

# Schema for returning an audit log entry
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource_type: str
    resource_id: Optional[int]
    details: Optional[Dict] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

# Schema for creating a comment on a test report
class CommentCreate(BaseModel):
    comment_text: str

    model_config = ConfigDict(from_attributes=True)

# Schema for returning a comment on a test report
class CommentResponse(BaseModel):
    id: int
    test_report_id: int
    user_id: int
    comment_text: str
    created_at: datetime
    username: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
