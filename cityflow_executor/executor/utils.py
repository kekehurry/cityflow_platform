from pydantic import BaseModel, Field
from typing import Any, ClassVar, Dict, List, Optional, Type, Union


class File(BaseModel):
    """(Experimental) A class that represents a file."""
    path: str = Field(description="The path of the file.")
    data: str = Field(description="The content of the file.")

class CodeBlock(BaseModel):
    """(Experimental) A class that represents a code block."""
    session_id: str = Field(description="The id of the code block.")
    code: str = Field(description="The code to execute.")
    language: str = Field(description="The language of the code.")
    files: Optional[List[File]] = Field(
        default=None,
        description="The dependency file for the code block.",
    )

class CodeResult(BaseModel):
    """(Experimental) A class that represents the result of a code execution."""
    exit_code: int = Field(description="The exit code of the code execution.")
    console: str = Field(description="The console output of the code execution.")
    output: str = Field(description="The output of the code execution.")