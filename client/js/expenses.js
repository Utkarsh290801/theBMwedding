// ======================================
// BM Wedding Expenses
// ======================================

// -----------------------------
// DOM Elements
// -----------------------------

const expenseTableBody = document.getElementById("expenseTableBody");

const searchExpense = document.getElementById("searchExpense");
const filterCategory = document.getElementById("filterCategory");
const filterStatus = document.getElementById("filterStatus");
const filterPayment = document.getElementById("filterPayment");

const addExpenseBtn = document.getElementById("addExpenseBtn");
const setBudgetBtn = document.getElementById("setBudgetBtn");

const saveExpense = document.getElementById("saveExpense");
const saveBudget = document.getElementById("saveBudget");

const totalBudget = document.getElementById("totalBudget");
const totalSpent = document.getElementById("totalSpent");
const remainingBudget = document.getElementById("remainingBudget");
const totalTransactions = document.getElementById("totalTransactions");

const spentLabel = document.getElementById("spentLabel");
const remainingLabel = document.getElementById("remainingLabel");
const budgetPercent = document.getElementById("budgetPercent");
const budgetProgress = document.getElementById("budgetProgress");

const emptyExpenses = document.getElementById("emptyExpenses");

// -----------------------------
// Bootstrap Modals
// -----------------------------

const expenseModal = new bootstrap.Modal(
  document.getElementById("expenseModal"),
);

const budgetModal = new bootstrap.Modal(document.getElementById("budgetModal"));

// -----------------------------
// App State
// -----------------------------

let expenses = [];

let budget = 0;

let editingExpense = null;
// ======================================
// Currency Formatter
// ======================================

function formatCurrency(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

// ======================================
// Load Budget
// ======================================

async function loadBudget() {
  try {
    const res = await API.get("/budget");

    budget = res.data.totalBudget || 0;
  } catch {
    budget = 0;
  }
}

// ======================================
// Save Budget
// ======================================

saveBudget.addEventListener("click", async () => {
  const value = Number(document.getElementById("budgetInput").value);

  try {
    await API.post("/budget", {
      totalBudget: value,
    });

    budget = value;

    updateStatistics();

    budgetModal.hide();

    showToast("Budget Updated");
  } catch (error) {
    console.error(error);

    showToast(
      "Failed to update budget",

      "error",
    );
  }
});
// ======================================
// Load Expenses
// ======================================

async function loadExpenses() {
  try {
    const response = await API.get("/expenses");

    expenses = response.data || [];

    updateStatistics();

    renderExpenses();
  } catch (error) {
    console.error(error);

    showToast(
      "Failed to load expenses",

      "error",
    );
  }
}
// ======================================
// Statistics
// ======================================

function updateStatistics() {
  const spent = expenses.reduce(
    (sum, item) => sum + Number(item.amount),

    0,
  );

  const remaining = Math.max(
    budget - spent,

    0,
  );

  const percent = budget === 0 ? 0 : Math.round((spent / budget) * 100);

  totalBudget.textContent = formatCurrency(budget);

  totalSpent.textContent = formatCurrency(spent);

  remainingBudget.textContent = formatCurrency(remaining);

  totalTransactions.textContent = expenses.length;

  spentLabel.textContent = formatCurrency(spent);

  remainingLabel.textContent = formatCurrency(remaining);

  budgetPercent.textContent = percent + "%";

  budgetProgress.style.width = percent + "%";
}
// ======================================
// Render Expenses
// ======================================

function renderExpenses() {
  expenseTableBody.innerHTML = "";

  const search = searchExpense.value.toLowerCase();

  const category = filterCategory.value;

  const status = filterStatus.value;

  const payment = filterPayment.value;

  const filtered = expenses.filter((expense) => {
    const matchSearch =
      expense.vendor.toLowerCase().includes(search) ||
      expense.description.toLowerCase().includes(search);

    const matchCategory = !category || expense.category === category;

    const matchStatus = !status || expense.status === status;

    const matchPayment = !payment || expense.paymentMethod === payment;

    return matchSearch && matchCategory && matchStatus && matchPayment;
  });

  // -------------------------
  // Empty State
  // -------------------------

  if (filtered.length === 0) {
    emptyExpenses.classList.remove("d-none");

    return;
  }

  emptyExpenses.classList.add("d-none");

  // -------------------------
  // Rows
  // -------------------------

  filtered.forEach((expense) => {
    const statusClass =
      expense.status === "Paid" ? "status-paid" : "status-pending";

    expenseTableBody.innerHTML += `

        <tr>

            <td>

                ${new Date(expense.date).toLocaleDateString("en-IN")}

            </td>

            <td>

                <span class="category-badge">

                    ${expense.category}

                </span>

            </td>

            <td>

                ${expense.vendor}

            </td>

            <td>

                ${expense.description}

            </td>

            <td>

                <strong>

                    ${formatCurrency(expense.amount)}

                </strong>

            </td>

            <td>

                <span class="${statusClass}">

                    ${expense.status}

                </span>

            </td>

            <td>

                ${expense.paymentMethod}

            </td>

            <td>

                ${
                  expense.receiptUrl
                    ? `<a

                        href="${expense.receiptUrl}"

                        target="_blank"

                        class="btn btn-sm btn-light">

                        <i class="ri-file-download-line"></i>

                    </a>`
                    : "-"
                }

            </td>

            <td>

                <button

                    class="action-btn edit-btn"

                    onclick="editExpense('${expense._id}')">

                    <i class="ri-pencil-fill"></i>

                </button>

                <button

                    class="action-btn delete-btn"

                    onclick="deleteExpense('${expense._id}')">

                    <i class="ri-delete-bin-fill"></i>

                </button>

            </td>

        </tr>

        `;
  });
}
// ======================================
// Search & Filters
// ======================================

searchExpense.addEventListener(
  "input",

  renderExpenses,
);

filterCategory.addEventListener(
  "change",

  renderExpenses,
);

filterStatus.addEventListener(
  "change",

  renderExpenses,
);

filterPayment.addEventListener(
  "change",

  renderExpenses,
);

// ======================================
// Open Expense Modal
// ======================================

addExpenseBtn.addEventListener("click", () => {
  editingExpense = null;

  clearExpenseForm();

  document.getElementById("expenseModalTitle").innerHTML = `
        <i class="ri-money-rupee-circle-fill"></i>
        Add Expense
    `;

  expenseModal.show();
});

// ======================================
// Save Expense
// ======================================

saveExpense.addEventListener("click", async () => {
  const category = document.getElementById("expenseCategory").value.trim();
  const vendor = document.getElementById("expenseVendor").value.trim();
  const amountValue = document.getElementById("expenseAmount").value.trim();
  const description = document
    .getElementById("expenseDescription")
    .value.trim();
  const dateValue = document.getElementById("expenseDate").value;
  const paymentMethod = document.getElementById("paymentMethod").value;
  const status = document.getElementById("expenseStatus").value;
  const notes = document.getElementById("expenseNotes").value.trim();

  if (!category || !vendor || !amountValue) {
    showToast("Please fill category, vendor, and amount", "error");
    return;
  }

  const amount = Number(amountValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("Please enter a valid amount", "error");
    return;
  }

  const formData = new FormData();

  formData.append("category", category);
  formData.append("vendor", vendor);
  formData.append("description", description);
  formData.append("amount", String(amount));
  formData.append("date", dateValue || new Date().toISOString().slice(0, 10));
  formData.append("paymentMethod", paymentMethod);
  formData.append("status", status);
  formData.append("notes", notes);

  const receipt = document.getElementById("expenseReceipt").files[0];

  if (receipt) {
    formData.append("receipt", receipt);
  }

  try {
    if (editingExpense) {
      await API.put(
        `/expenses/${editingExpense}`,

        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      showToast("Expense Updated");
    } else {
      await API.post(
        "/expenses",

        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      showToast("Expense Added");
    }

    expenseModal.hide();

    clearExpenseForm();

    editingExpense = null;

    loadExpenses();
  } catch (error) {
    console.error(error);

    showToast("Failed to save expense", "error");
  }
});
// ======================================
// Edit Expense
// ======================================

function editExpense(id) {
  const expense = expenses.find((item) => item._id === id);

  if (!expense) return;

  editingExpense = id;

  document.getElementById("expenseCategory").value = expense.category;

  document.getElementById("expenseVendor").value = expense.vendor;

  document.getElementById("expenseDescription").value = expense.description;

  document.getElementById("expenseAmount").value = expense.amount;

  document.getElementById("expenseDate").value = expense.date.substring(0, 10);

  document.getElementById("paymentMethod").value = expense.paymentMethod;

  document.getElementById("expenseStatus").value = expense.status;

  document.getElementById("expenseNotes").value = expense.notes || "";

  document.getElementById("expenseModalTitle").innerHTML = `
        <i class="ri-edit-fill"></i>
        Update Expense
    `;

  expenseModal.show();
}

// ======================================
// Delete Expense
// ======================================

async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;

  try {
    await API.delete(`/expenses/${id}`);

    showToast("Expense Deleted");

    loadExpenses();
  } catch (error) {
    console.error(error);

    showToast("Delete Failed", "error");
  }
}
// ======================================
// Clear Form
// ======================================

function clearExpenseForm() {
  document.getElementById("expenseCategory").selectedIndex = 0;

  document.getElementById("expenseVendor").value = "";

  document.getElementById("expenseDescription").value = "";

  document.getElementById("expenseAmount").value = "";

  document.getElementById("expenseDate").value = "";

  document.getElementById("paymentMethod").selectedIndex = 0;

  document.getElementById("expenseStatus").selectedIndex = 0;

  document.getElementById("expenseNotes").value = "";

  document.getElementById("expenseReceipt").value = "";
}

// ======================================
// Budget Button
// ======================================

setBudgetBtn.addEventListener("click", () => {
  document.getElementById("budgetInput").value = budget;

  budgetModal.show();
});

// ======================================
// Modal Reset
// ======================================

document

  .getElementById("expenseModal")

  .addEventListener(
    "hidden.bs.modal",

    () => {
      editingExpense = null;

      clearExpenseForm();
    },
  );

// ======================================
// Initialize
// ======================================

document.addEventListener(
  "DOMContentLoaded",

  async () => {
    await loadBudget();

    await loadExpenses();
  },
);
