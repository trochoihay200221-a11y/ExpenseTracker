let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = Number(localStorage.getItem("budget")) || 0;
let chart;

// Load data when page opens
displayExpenses();
updateSummary();

if (budget > 0) {
    document.getElementById("budget").value = budget;
}

// Add Expense
function addExpense() {

    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value.trim();

    if (amount <= 0 || date === "") {
        alert("Please enter a valid amount and date.");
        return;
    }

    expenses.push({
        amount,
        category,
        date,
        note
    });

    saveData();
    clearForm();
}

// Save Budget
function saveBudget() {

    budget = Number(document.getElementById("budget").value);

    localStorage.setItem("budget", budget);

    updateSummary();
}

// Display Expenses
function displayExpenses() {

    const table = document.getElementById("expenseTable");

    table.innerHTML = "";

    expenses.forEach((expense, index) => {

        table.innerHTML += `
        <tr>
            <td>$${expense.amount}</td>
            <td>${expense.category}</td>
            <td>${expense.date}</td>
            <td>${expense.note}</td>
            <td>
                <button class="action-btn edit" onclick="editExpense(${index})">
                    Edit
                </button>

                <button class="action-btn delete" onclick="deleteExpense(${index})">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });

    drawChart();
}

// Edit Expense
function editExpense(index){

    const e = expenses[index];

    document.getElementById("amount").value = e.amount;
    document.getElementById("category").value = e.category;
    document.getElementById("date").value = e.date;
    document.getElementById("note").value = e.note;

    expenses.splice(index,1);

    saveData();
}

// Delete Expense
function deleteExpense(index){

    if(confirm("Delete this expense?")){

        expenses.splice(index,1);

        saveData();

    }

}

// Update Summary
function updateSummary(){

    const total = expenses.reduce((sum,e)=>sum+e.amount,0);

    document.getElementById("total").innerText="$"+total.toFixed(2);

    document.getElementById("count").innerText=expenses.length;

    const warning=document.getElementById("budgetWarning");

    if(budget>0){

        if(total>budget){

            warning.innerText="⚠ Budget exceeded!";

        }

        else{

            warning.innerText=
            "Remaining Budget: $" + (budget-total).toFixed(2);

        }

    }

    else{

        warning.innerText="";

    }

}

// Save Data
function saveData(){

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    displayExpenses();

    updateSummary();

}

// Clear Form
function clearForm(){

    document.getElementById("amount").value="";
    document.getElementById("date").value="";
    document.getElementById("note").value="";

}

// Draw Pie Chart
function drawChart(){

    const totals={};

    expenses.forEach(e=>{

        totals[e.category]=(totals[e.category]||0)+e.amount;

    });

    const labels=Object.keys(totals);

    const values=Object.values(totals);

    if(chart){

        chart.destroy();

    }

    chart=new Chart(document.getElementById("pieChart"),{

        type:"pie",

        data:{

            labels:labels,

            datasets:[{

                data:values

            }]

        }

    });

}

// Export CSV
function exportCSV(){

    let csv="Amount,Category,Date,Note\n";

    expenses.forEach(e=>{

        csv+=`${e.amount},${e.category},${e.date},${e.note}\n`;

    });

    const blob=new Blob([csv],{type:"text/csv"});

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="expenses.csv";

    a.click();

}

// Export PDF
function exportPDF(){

    const {jsPDF}=window.jspdf;

    const doc=new jsPDF();

    doc.setFontSize(16);

    doc.text("Expense Tracker Report",20,20);

    let y=35;

    expenses.forEach(e=>{

        doc.text(
            `${e.date} | ${e.category} | $${e.amount} | ${e.note}`,
            20,
            y
        );

        y+=10;

    });

    doc.save("Expense_Report.pdf");

}