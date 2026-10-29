from typing import List, Dict, Any, Set
from datetime import datetime, timedelta

def analyze_timeline(tasks: List[Dict[str, Any]], reference_date_str: str = "2026-10-29") -> Dict[str, Any]:
    """
    Analyzes dependency graph (DAG) of event tasks:
    - Identifies dependency chains and calculates critical path
    - Flags overdue tasks relative to reference date
    - Detects dependency order violations (where child task deadline < parent task deadline)
    - Detects circular dependencies if any
    """
    task_map: Dict[str, Dict[str, Any]] = {t["id"]: t for t in tasks}
    ref_date = datetime.strptime(reference_date_str[:10], "%Y-%m-%d")

    overdue_tasks = []
    conflict_tasks = []
    children_map: Dict[str, List[str]] = {t["id"]: [] for t in tasks}
    in_degrees: Dict[str, int] = {t["id"]: 0 for t in tasks}

    for t in tasks:
        tid = t["id"]
        t_deadline_str = t.get("deadline", "")[:10]
        try:
            t_date = datetime.strptime(t_deadline_str, "%Y-%m-%d")
            if t.get("status") not in ["Completed", "Done"] and t_date < ref_date:
                overdue_tasks.append({
                    "id": tid,
                    "name": t.get("name"),
                    "deadline": t_deadline_str,
                    "days_overdue": (ref_date - t_date).days
                })
        except Exception:
            pass

        deps = t.get("dependencies", [])
        for dep_id in deps:
            if dep_id in task_map:
                children_map[dep_id].append(tid)
                in_degrees[tid] += 1
                dep_deadline_str = task_map[dep_id].get("deadline", "")[:10]
                try:
                    dep_date = datetime.strptime(dep_deadline_str, "%Y-%m-%d")
                    if t_date < dep_date:
                        conflict_tasks.append({
                            "child_id": tid,
                            "child_name": t.get("name"),
                            "child_deadline": t_deadline_str,
                            "parent_id": dep_id,
                            "parent_name": task_map[dep_id].get("name"),
                            "parent_deadline": dep_deadline_str,
                            "issue": f"Child task '{t.get('name')}' is scheduled BEFORE its dependency '{task_map[dep_id].get('name')}'."
                        })
                except Exception:
                    pass

    # Critical path calculation using longest path in DAG
    # Topological sort
    queue = [tid for tid, deg in in_degrees.items() if deg == 0]
    topo_order = []
    while queue:
        curr = queue.pop(0)
        topo_order.append(curr)
        for child in children_map.get(curr, []):
            in_degrees[child] -= 1
            if in_degrees[child] == 0:
                queue.append(child)

    has_cycle = len(topo_order) < len(tasks)

    # Calculate longest path (critical path)
    dist: Dict[str, int] = {t["id"]: 1 for t in tasks}
    prev: Dict[str, str] = {t["id"]: None for t in tasks}

    for u in topo_order:
        for v in children_map.get(u, []):
            if dist[u] + 1 > dist[v]:
                dist[v] = dist[u] + 1
                prev[v] = u

    critical_path = []
    if dist:
        end_node = max(dist, key=dist.get)
        curr = end_node
        while curr:
            critical_path.append(curr)
            curr = prev.get(curr)
        critical_path.reverse()

    critical_tasks = [task_map[tid] for tid in critical_path if tid in task_map]

    return {
        "total_tasks": len(tasks),
        "completed_count": sum(1 for t in tasks if t.get("status") in ["Completed", "Done"]),
        "in_progress_count": sum(1 for t in tasks if t.get("status") == "In Progress"),
        "overdue_tasks": overdue_tasks,
        "conflict_tasks": conflict_tasks,
        "has_circular_dependencies": has_cycle,
        "critical_path_ids": critical_path,
        "critical_tasks": critical_tasks
    }

def recalculate_cascade(tasks: List[Dict[str, Any]], shifted_task_id: str, new_deadline_str: str) -> Dict[str, Any]:
    """
    When a task's deadline changes:
    - Identifies affected downstream tasks
    - Recalculates dependent deadlines
    - Recommends revised sequence
    """
    task_map: Dict[str, Dict[str, Any]] = {t["id"]: dict(t) for t in tasks}
    if shifted_task_id not in task_map:
        return {"success": False, "error": f"Task {shifted_task_id} not found"}

    target = task_map[shifted_task_id]
    old_deadline = target.get("deadline", "")[:10]
    target["deadline"] = new_deadline_str

    try:
        new_date = datetime.strptime(new_deadline_str[:10], "%Y-%m-%d")
        old_date = datetime.strptime(old_deadline, "%Y-%m-%d")
        shift_days = (new_date - old_date).days
    except Exception as e:
        return {"success": False, "error": f"Invalid date format: {e}"}

    # Downstream BFS
    affected_tasks = []
    queue = [shifted_task_id]
    visited = set()

    while queue:
        curr_id = queue.pop(0)
        for t in tasks:
            if curr_id in t.get("dependencies", []):
                tid = t["id"]
                if tid not in visited:
                    visited.add(tid)
                    queue.append(tid)
                    affected_tasks.append(tid)

    # Shift dependent deadlines if delayed
    updated_tasks = []
    for tid in affected_tasks:
        t = task_map[tid]
        cur_d_str = t.get("deadline", "")[:10]
        try:
            cur_d = datetime.strptime(cur_d_str, "%Y-%m-%d")
            updated_d = cur_d + timedelta(days=max(0, shift_days))
            t["deadline"] = updated_d.strftime("%Y-%m-%d")
            updated_tasks.append({
                "id": tid,
                "name": t.get("name"),
                "old_deadline": cur_d_str,
                "new_deadline": t["deadline"],
                "shift_days": shift_days
            })
        except Exception:
            pass

    return {
        "success": True,
        "shifted_task_id": shifted_task_id,
        "shift_days": shift_days,
        "affected_count": len(affected_tasks),
        "cascade_updates": updated_tasks,
        "recommendation": f"Downstream schedule shifted forward by {shift_days} days to preserve dependency buffers. Verify vendor readiness for updated dates."
    }
