"use strict";

const STORAGE_KEY = "personalExpenseTracker.transactions";

let transactions = loadTransactions();

let selectedTransactionType = "";
let selectedTransactionCategory = "";
let currentTypeFilter = "all";
let currentSearchTerm = "";
let storageWarningShown = false;

// Dashboard
const totalIncomeElement = document.querySelector("#totalIncome");
const totalExpensesElement = document.querySelector("#totalExpenses");
const currentBalanceElement = document.querySelector("#currentBalance");

// Transaction form
const transactionForm = document.querySelector("#transactionForm");

const transactionTypeButton = document.querySelector(
  "#transactionTypeButton"
);

const selectedOption = document.querySelector("#selectedOption");

const optionItems = document.querySelectorAll(
  "#optionMenu .menu-item"
);

const transactionDescriptionInput = document.querySelector(
  "#transactionDescription"
);

const transactionAmountInput = document.querySelector(
  "#transactionAmount"
);

const categoryButton = document.querySelector("#categoryButton");

const selectedCategory = document.querySelector("#selectedCategory");

const categoryItems = document.querySelectorAll(
  "#categoryMenu .menu-item"
);

const transactionDateInput = document.querySelector("#transactionDate");

const clearFormButton = document.querySelector("#clearFormButton");

// Form validation messages
const transactionTypeFeedback = document.querySelector(
  "#transactionTypeFeedback"
);

const descriptionFeedback = document.querySelector(
  "#descriptionFeedback"
);

const amountFeedback = document.querySelector(
  "#amountFeedback"
);

const categoryFeedback = document.querySelector(
  "#categoryFeedback"
);

const dateFeedback = document.querySelector("#dateFeedback");

// History filters
const transactionFilterButton = document.querySelector(
  "#transactionFilterButton"
);

const selectedFilterLabel = document.querySelector(
  "#selectedFilterLabel"
);

const filterItems = document.querySelectorAll(
  "#transactionFilterMenu .menu-item"
);

const transactionSearchInput = document.querySelector(
  "#transactionSearch"
);

// History table
const transactionTableBody = document.querySelector(
  "#transactionTableBody"
);

const amountFormatter = new Intl.NumberFormat("en-LK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatAmount(amount) {
  return `LKR ${amountFormatter.format(amount)}`;
}

function getLocalDateString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
  // Construct a local date to avoid UTC date shifts.
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function createTransactionId() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTransactions() {
  try {
    const storedTransactions = localStorage.getItem(STORAGE_KEY);

    if (!storedTransactions) {
      return [];
    }

    const parsedTransactions = JSON.parse(storedTransactions);

    if (!Array.isArray(parsedTransactions)) {
      return [];
    }

    // Ignore malformed entries rather than allowing them
    // to break the application.
    return parsedTransactions
      .filter((transaction) => {
        return (
          transaction &&
          typeof transaction.id === "string" &&
          typeof transaction.date === "string" &&
          typeof transaction.description === "string" &&
          typeof transaction.category === "string" &&
          ["Income", "Expense"].includes(transaction.type) &&
          Number.isFinite(Number(transaction.amount)) &&
          Number(transaction.amount) > 0
        );
      })
      .map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        amount: Number(transaction.amount),
        createdAt: Number(transaction.createdAt) || 0
      }));
  } catch (error) {
    console.error("Could not load saved transactions:", error);
    return [];
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );

    return true;
  } catch (error) {
    console.error("Could not save transactions:", error);

    if (!storageWarningShown) {
      window.alert(
        "Your browser could not save the transactions. " +
        "Your current changes may be lost when you reload the page."
      );

      storageWarningShown = true;
    }

    return false;
  }
}

function setFieldError(field, feedback, hasError) {
  field.classList.toggle("is-invalid", hasError);

  if (hasError) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }

  feedback.classList.toggle("d-none", !hasError);
}

function clearValidationErrors() {
  setFieldError(
    transactionTypeButton,
    transactionTypeFeedback,
    false
  );

  setFieldError(
    transactionDescriptionInput,
    descriptionFeedback,
    false
  );

  setFieldError(
    transactionAmountInput,
    amountFeedback,
    false
  );

  setFieldError(
    categoryButton,
    categoryFeedback,
    false
  );

  setFieldError(
    transactionDateInput,
    dateFeedback,
    false
  );
}

optionItems.forEach((item) => {
  item.addEventListener("click", () => {
    const type = item.textContent.trim();

    selectedTransactionType = type;
    selectedOption.textContent = type;

    // Remove any previously selected type colour.
    transactionTypeButton.classList.remove(
      "theme-success",
      "theme-danger"
    );

    // Income is green; expense is red.
    if (type === "Income") {
      transactionTypeButton.classList.add("theme-success");
    } else if (type === "Expense") {
      transactionTypeButton.classList.add("theme-danger");
    }

    setFieldError(
      transactionTypeButton,
      transactionTypeFeedback,
      false
    );
  });
});

categoryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const category = item.textContent.trim();

    selectedTransactionCategory = category;
    selectedCategory.textContent = category;

    setFieldError(
      categoryButton,
      categoryFeedback,
      false
    );
  });
});

function resetTransactionForm() {
  transactionForm.reset();

  selectedTransactionType = "";
  selectedTransactionCategory = "";

  selectedOption.textContent = "Select an option";
  selectedCategory.textContent = "Select a category";

  transactionTypeButton.classList.remove(
    "theme-success",
    "theme-danger"
  );

  // Reset the date to today.
  transactionDateInput.value = getLocalDateString();

  clearValidationErrors();
}

clearFormButton.addEventListener("click", resetTransactionForm);

transactionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = transactionDescriptionInput.value.trim();

  const amountText = transactionAmountInput.value.trim();
  const amount = Number(amountText);

  const date = transactionDateInput.value;

  const errors = [
    {
      field: transactionTypeButton,
      feedback: transactionTypeFeedback,
      invalid: !selectedTransactionType
    },
    {
      field: transactionDescriptionInput,
      feedback: descriptionFeedback,
      invalid: description.length === 0
    },
    {
      field: transactionAmountInput,
      feedback: amountFeedback,
      invalid:
        amountText === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
    },
    {
      field: categoryButton,
      feedback: categoryFeedback,
      invalid: !selectedTransactionCategory
    },
    {
      field: transactionDateInput,
      feedback: dateFeedback,
      invalid: !date
    }
  ];

  let firstInvalidField = null;

  errors.forEach(({ field, feedback, invalid }) => {
    setFieldError(field, feedback, invalid);

    if (invalid && firstInvalidField === null) {
      firstInvalidField = field;
    }
  });

  if (firstInvalidField) {
    firstInvalidField.focus();
    return;
  }

  const roundedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;

  if (roundedAmount <= 0) {
    setFieldError(
      transactionAmountInput,
      amountFeedback,
      true
    );

    transactionAmountInput.focus();
    return;
  }

  const transaction = {
    id: createTransactionId(),
    date,
    description,
    type: selectedTransactionType,
    category: selectedTransactionCategory,
    amount: roundedAmount,
    createdAt: Date.now()
  };

  transactions.unshift(transaction);

  saveTransactions();

  updateDashboard();
  renderTransactions();

  resetTransactionForm();
});

function updateDashboard() {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "Income") {
      totalIncome += transaction.amount;
    } else if (transaction.type === "Expense") {
      totalExpenses += transaction.amount;
    }
  });

  const balance = totalIncome - totalExpenses;

  totalIncomeElement.textContent = formatAmount(totalIncome);
  totalExpensesElement.textContent = formatAmount(totalExpenses);
  currentBalanceElement.textContent = formatAmount(balance);
}

filterItems.forEach((item) => {
  item.addEventListener("click", () => {
    currentTypeFilter = item.dataset.filter;

    selectedFilterLabel.textContent = item.textContent.trim();

    renderTransactions();
  });
});

transactionSearchInput.addEventListener("input", () => {
  currentSearchTerm = transactionSearchInput.value
    .trim()
    .toLocaleLowerCase();

  renderTransactions();
});


// --------------------------------------------------
// Delete transaction
// --------------------------------------------------

function deleteTransaction(id) {
  const transaction = transactions.find(
    (item) => item.id === id
  );

  if (!transaction) {
    return;
  }

  const confirmed = window.confirm(
    `Delete the transaction "${transaction.description}"?`
  );

  if (!confirmed) {
    return;
  }

  transactions = transactions.filter(
    (item) => item.id !== id
  );

  saveTransactions();

  updateDashboard();
  renderTransactions();
}


// --------------------------------------------------
// Create a transaction table cell
// --------------------------------------------------

function createCell(text, className = "") {
  const cell = document.createElement("td");

  cell.textContent = text;
  cell.className = className;

  return cell;
}


// --------------------------------------------------
// Render transaction history
// --------------------------------------------------

function renderTransactions() {
  const searchTerm = currentSearchTerm;

  const filteredTransactions = transactions
    .filter((transaction) => {
      // Apply the type filter.
      const matchesType =
        currentTypeFilter === "all" ||
        (
          currentTypeFilter === "income" &&
          transaction.type === "Income"
        ) ||
        (
          currentTypeFilter === "expense" &&
          transaction.type === "Expense"
        );

      // Search by description or category.
      const matchesSearch =
        transaction.description
          .toLocaleLowerCase()
          .includes(searchTerm) ||
        transaction.category
          .toLocaleLowerCase()
          .includes(searchTerm);

      return matchesType && matchesSearch;
    })
    .sort((first, second) => {
      // Show the most recent transaction date first.
      return (
        second.date.localeCompare(first.date) ||
        second.createdAt - first.createdAt
      );
    });

  // Remove the existing rows before rebuilding the table.
  transactionTableBody.replaceChildren();

  if (filteredTransactions.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.className = "text-center text-muted py-4";

    if (transactions.length === 0) {
      cell.textContent =
        "No transactions recorded yet. Add a transaction above.";
    } else {
      cell.textContent =
        "No transactions match your search or filter.";
    }

    row.appendChild(cell);
    transactionTableBody.appendChild(row);

    return;
  }

  filteredTransactions.forEach((transaction) => {
    const row = document.createElement("tr");

    const isIncome = transaction.type === "Income";

    const typeClass = isIncome
      ? "text-success fw-semibold"
      : "text-danger fw-semibold";

    // Date
    row.appendChild(
      createCell(formatDate(transaction.date), "text-nowrap")
    );

    // Description
    row.appendChild(
      createCell(transaction.description)
    );

    // Type
    row.appendChild(
      createCell(transaction.type, typeClass)
    );

    // Category
    row.appendChild(
      createCell(transaction.category)
    );

    // Amount
    row.appendChild(
      createCell(
        formatAmount(transaction.amount),
        `text-end text-nowrap ${typeClass}`
      )
    );

    // Actions
    const actionsCell = document.createElement("td");
    actionsCell.className = "text-end";

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "btn-solid theme-danger btn-sm";
    deleteButton.textContent = "Delete";

    deleteButton.setAttribute(
      "aria-label",
      `Delete transaction: ${transaction.description}`
    );

    deleteButton.addEventListener("click", () => {
      deleteTransaction(transaction.id);
    });

    actionsCell.appendChild(deleteButton);
    row.appendChild(actionsCell);

    transactionTableBody.appendChild(row);
  });
}


// --------------------------------------------------
// Initialise application
// --------------------------------------------------

// Start with today's date in the form.
transactionDateInput.value = getLocalDateString();

// Load the dashboard and transaction history.
updateDashboard();
renderTransactions();