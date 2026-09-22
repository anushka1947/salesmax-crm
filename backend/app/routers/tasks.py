"""
Tasks Router — All API endpoints for managing Tasks and Follow-ups.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.task import Task
from app.models.lead import Lead
from app.models.contact import Contact
from app.models.activity import Activity
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/",
    response_model=List[TaskResponse],
    summary="Get all tasks",
    description="Returns all tasks. Optionally filter by status (Pending, Completed), lead_id, or contact_id.",
)
def get_tasks(
    status: Optional[str] = None,
    lead_id: Optional[int] = None,
    contact_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Task)
    if status is not None:
        query = query.filter(Task.status == status)
    if lead_id is not None:
        query = query.filter(Task.lead_id == lead_id)
    if contact_id is not None:
        query = query.filter(Task.contact_id == contact_id)
    return query.order_by(Task.created_at.desc()).all()


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get a single task",
    description="Returns a task by its ID.",
)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
    return task


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Creates a task/follow-up and logs an activity record.",
)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    if task.lead_id is not None:
        lead = db.query(Lead).filter(Lead.id == task.lead_id).first()
        if lead is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Lead with id {task.lead_id} not found",
            )

    if task.contact_id is not None:
        contact = db.query(Contact).filter(Contact.id == task.contact_id).first()
        if contact is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Contact with id {task.contact_id} not found",
            )

    new_task = Task(
        title=task.title,
        type=task.type,
        due_date=task.due_date,
        priority=task.priority,
        status=task.status,
        lead_id=task.lead_id,
        contact_id=task.contact_id,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Log to timeline
    activity = Activity(
        type="task_created",
        title=f"Task Created: {new_task.title}",
        description=f"Type: {new_task.type} | Priority: {new_task.priority} | Due: {new_task.due_date or 'No date'}",
        lead_id=new_task.lead_id,
        contact_id=new_task.contact_id,
    )
    db.add(activity)
    db.commit()

    return new_task


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
    description="Updates task properties.",
)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )

    update_data = task_update.model_dump(exclude_unset=True)

    if "lead_id" in update_data and update_data["lead_id"] is not None:
        lead = db.query(Lead).filter(Lead.id == update_data["lead_id"]).first()
        if lead is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Lead with id {update_data['lead_id']} not found",
            )

    if "contact_id" in update_data and update_data["contact_id"] is not None:
        contact = db.query(Contact).filter(Contact.id == update_data["contact_id"]).first()
        if contact is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated Contact with id {update_data['contact_id']} not found",
            )

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.put(
    "/{task_id}/toggle",
    response_model=TaskResponse,
    summary="Toggle task status",
    description="Toggles task status between Pending and Completed.",
)
def toggle_task_status(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )

    # Toggle status
    new_status = "Completed" if task.status == "Pending" else "Pending"
    task.status = new_status

    if new_status == "Completed":
        activity = Activity(
            type="task_completed",
            title=f"Task Completed: {task.title}",
            description=f"Action item '{task.title}' was marked as completed.",
            lead_id=task.lead_id,
            contact_id=task.contact_id,
        )
        db.add(activity)

    db.commit()
    db.refresh(task)
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
    description="Deletes a task.",
)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
    db.delete(task)
    db.commit()
    return
