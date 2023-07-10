function App() {
  return (
    <div className="app">
      <Logo />

      <main>
        <Form />
        <PackingList />
      </main>

      <Stats />
    </div>
  );
}

function Logo() {
  return (
    <header>
      <h1>🏝️ Far Away 🧳</h1>
    </header>
  );
}

function Form() {
  return (
    <div className="add-form">
      <h3>What do you need for your trip🤩🛄?</h3>
      <input type="text" />
    </div>
  );
}

function PackingList() {
  return (
    <div className="list">
      Hello
    </div>
  );
}

function Stats() {
  return (
    <footer className="stats">
      <p>
        <i>
          You have X items on your list, and you have already packed X (X%)
        </i>
      </p>
    </footer>
  );
}


export default App;
