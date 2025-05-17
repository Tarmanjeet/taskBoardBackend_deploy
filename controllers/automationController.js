const Automation = require("../models/automationSchema");
const Task = require("../models/taskSchema");

const checkAutomation = async (task, fieldChanged, newValue) => {
  const automations = await Automation.find({
    project: task.projectId,
    status: "Active",
    "trigger.type": fieldChanged === "status" ? "Status Change" : "Assignee change",
    "trigger.condition": { [fieldChanged]: newValue },
  })

  for (const auto of automations) {
    const actionType = auto.action.type;
    const actionValue = auto.action.value;

    if (actionType === "assign badge") {
      task.badges = task.badges || [];
      if (!task.badges.includes(actionValue)) {
        task.badges.push(actionValue);
        await task.save();
      }
    }

    if (actionType === "Move task") {
      task.status = actionValue;
      await task.save();
    }
  }
}

const triggerAutomation = async (req, res) => {
  try {
    const { taskId, fieldChanged, newValue } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" })

    await checkAutomation(task, fieldChanged, newValue);

    res.status(200).json({ message: "Automation processed", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  triggerAutomation,
  checkAutomation
};
