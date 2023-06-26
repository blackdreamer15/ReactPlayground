const messages = [
    "Learn React ⚛️",
    "Apply for jobs 💼",
    "Invest your new income 🤑",
];

function App() {
    let step = 1;

    return (
        <div className="steps">
            <div className="numbers">
                <div className={step >= 1 ? "active" : ""}>1</div>
                <div>2</div>
                <div>3</div>
            </div>

            <p className="message">
                {`Step ${step}: ${messages[step - 1]}`}
            </p>

            <div className="buttons">
                <button style={{ backgroundColor: '#7950f2', color: '#fff' }}>
                    <span>Previous</span>
                </button>
                <button style={{ backgroundColor: '#7950f2', color: '#fff' }}>
                    <span>Next</span>
                </button>
            </div>
        </div>
    );
}
export default App;