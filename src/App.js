import "./App.css";
import { useState, useEffect } from "react";

import inventory from "./assets/inventory.txt";

function App() {
  const [customer, setCustomer] = useState(false);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsResp, setProductsResp] = useState([]);
  const [transaction, setTransaction] = useState(0);
  const [items, setItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [subtotalTax, setSubtotalTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [savedMoney, setSavedMoney] = useState(0);
  const date = new Date().toLocaleDateString();
  let productsDataFile;
  async function readFile() {
    await fetch(inventory)
      .then((res) => res.text())
      .then((text) => (productsDataFile = text));
    let productsData = productsDataFile.split("\n");

    productsData.forEach((product) => {
      let data = product.split(":");
      let data2 = data[1].split(",");
      let tax = true;
      if (data2[3].trim() === "Tax-Exempt") {
        tax = false;
      }

      let newProduct = {
        name: data[0],
        quantity: parseInt(data2[0]),
        regular: data2[1].split("$")[1],
        member: data2[2].split("$")[1],
        tax: tax,
      };

      setProducts((prevState) => [...prevState, newProduct]);
    });
  }

  useEffect(() => {
    async function readFilae() {
      await fetch(inventory)
        .then((res) => res.text())
        .then((text) => (productsDataFile = text));
      let productsData = productsDataFile.split("\n");

      productsData.forEach((product) => {
        let data = product.split(":");
        let data2 = data[1].split(",");
        let tax = true;
        if (data2[3].trim() === "Tax-Exempt") {
          tax = false;
        }

        let newProduct = {
          name: data[0],
          quantity: parseInt(data2[0]),
          regular: data2[1].split("$")[1],
          member: data2[2].split("$")[1],
          tax: tax,
        };

        setProducts((prevState) => [...prevState, newProduct]);
      });
    }
    readFile();
  }, []);

  const customerHandler = (e) => {
    if (e.target.value === "Regular") {
      setCustomer(false);
    } else {
      setCustomer(true);
    }
  };

  const addItem = (index) => {
    const exist = cart.find((item) => item.name === products[index].name);

    if (!exist) {
      let product = {
        name: products[index].name,
        quantity: 0,
        member: products[index].member,
        regular: products[index].regular,
        tax: products[index].tax,
      };

      setCart((prevState) => [...prevState, product]);
    }
  };

  const updateQuanity = (index, name, value) => {
    const stock = products.find((e) => e.name === name);
    const productIndex = products.indexOf(stock);

    if (stock.quantity + cart[index].quantity >= value) {
      if (value > cart[index].quantity) {
        const unit = value - cart[index].quantity;
        if (stock.quantity >= unit) {
          const cartRef = [...cart];
          const productsRef = [...products];
          productsRef[productIndex].quantity =
            productsRef[productIndex].quantity - unit;
          cartRef[index].quantity = value;
          setCart(cartRef);
          setProducts(productsRef);
          values();
        }
      } else if (value < cart[index].quantity) {
        const unit = cart[index].quantity - value;
        const cartRef = [...cart];
        const productsRef = [...products];
        productsRef[productIndex].quantity =
          productsRef[productIndex].quantity + unit;
        cartRef[index].quantity = value;
        setCart(cartRef);
        setProducts(productsRef);
        values();
      }
    }
  };

  const checkout = () => {
    var its = "";

    if (customer) {
      cart.forEach((element) => {
        its +=
          element.name +
          " => " +
          element.quantity +
          " | $" +
          element.member +
          " | $" +
          element.member * element.quantity +
          "\n";
      });
    } else {
      cart.forEach((element) => {
        its +=
          element.name +
          " => " +
          element.quantity +
          " | $" +
          element.regular +
          " | $" +
          element.regular * element.quantity +
          "\n";
      });
    }

    var myBlob = new Blob(
      [
        `
Date: ${date}
Transaction: ${transaction}

ITEM => QUANTITY | UNIT PRICE | TOTAL
${its}


TOTAL NUMBER OF ITEMS SOLD: ${items}
SUB-TOTAL: $ ${subtotal.toFixed(2)}
TAX (6.5%): $ ${(subtotalTax * 0.065).toFixed(2)}
TOTAL: ${(subtotal + subtotalTax * 0.065).toFixed(2)}
CASH: ${total}
CHANGE: $ ${totalChange.toFixed(2)}

*********************

YOU SAVED: $ ${savedMoney.toFixed(2)}
    `,
      ],
      {
        type: "text/plain",
      }
    );

    var url = window.URL.createObjectURL(myBlob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "transaction.txt";
    setTransaction(transaction + 1);
    anchor.click();
  };

  const cancel = () => {
    setCustomer(false);
    setCart([]);
    setProducts([]);
    readFile();
    setTransaction(0);
    setItems(0);
    setSubtotal(0);
    setSubtotalTax(0);
    setTotal(0);
    setTotalChange(0);
    setSavedMoney(0);
  };

  const values = () => {
    itemsCount();
    subTotal();
    subTotalTax();
    calcSavedMoney();
  };

  const itemsCount = () => {
    let c = 0;
    cart.forEach((element) => {
      c += element.quantity;
    });
    setItems(c);
  };

  const subTotal = () => {
    let c = 0;
    cart.forEach((element) => {
      if (customer) {
        c += element.member * element.quantity;
      } else {
        c += element.regular * element.quantity;
      }
    });
    setSubtotal(c);
  };

  const subTotalTax = () => {
    let c = 0;
    cart.forEach((element) => {
      if (element.tax) {
        if (customer) {
          c += element.member * element.quantity;
        } else {
          c += element.regular * element.quantity;
        }
      }
    });
    setSubtotalTax(c);
  };

  const calcSavedMoney = () => {
    let c = 0;
    let d = 0;
    cart.forEach((element) => {
      if (element.tax) {
        c +=
          element.member * element.quantity +
          element.member * element.quantity * 0.065;
      } else {
        c += element.member * element.quantity;
      }
    });
    cart.forEach((element) => {
      if (element.tax) {
        d +=
          element.regular * element.quantity +
          element.regular * element.quantity * 0.065;
      } else {
        d += element.regular * element.quantity;
      }
    });

    setSavedMoney(d - c);
  };

  const removeItem = (index) => {
    if (index === 0) {
      const cartResp = [...cart];
      cartResp.shift();
      setCart(cartResp);
    } else {
      const cartResp = [...cart];
      cartResp.splice(index, index);
      setCart(cartResp);
    }
  };

  return (
    <div className="App">
      <nav>
        <div>
          <h1>Jerry's Quick Mart</h1>
        </div>
      </nav>
      <main className="container">
        <div className="cashier">
          <h3>Cashier</h3>
          <div className="optionsNav">
            <div>
              <label>
                <b>Customer: </b>
              </label>
              <select onChange={(e) => customerHandler(e)}>
                <option value="Regular">Regular</option>
                <option value="Rewards">Rewards</option>
              </select>
            </div>
          </div>
          <div className="cart">
            <div>
              <b>Date:</b> {date}
            </div>
            <div>
              <b>TRANSACTION: {transaction}</b>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>QUANTITY</th>
                  <th>UNIT PRICE</th>
                  <th>TOTAL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuanity(
                            index,
                            item.name,
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </td>
                    {customer ? (
                      <td>${item.member}</td>
                    ) : (
                      <td>${item.regular}</td>
                    )}

                    {customer ? (
                      <td>${(item.member * item.quantity).toFixed(2)}</td>
                    ) : (
                      <td>${(item.regular * item.quantity).toFixed(2)}</td>
                    )}

                    <td>
                      <button type="button" onClick={() => removeItem(index)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={() => setCart([])}>
              Clean Cart
            </button>
            <br />
            <br />
            <div className="moneyData">
              <b>*********************</b>
              <br />
              <br />
              <b>TOTAL NUMBER OF ITEMS SOLD: {items}</b>
              <b>SUB-TOTAL: ${subtotal.toFixed(2)}</b>
              <b>TAX (6.5%): ${(subtotalTax * 0.065).toFixed(2)} </b>
              <b>TOTAL: {(subtotal + subtotalTax * 0.065).toFixed(2)}</b>
              <b>
                CASH:{" "}
                <input
                  type="text"
                  onChange={(e) => (
                    setTotalChange(
                      e.target.value -
                      (subtotal + subtotalTax * 0.065).toFixed(2)
                    ),
                    setTotal(e.target.value)
                  )}
                />
              </b>
              <b>CHANGE: {totalChange.toFixed(2)}</b>
              <br />
              <br />
              <b>*********************</b>
              <br />
              <br />

              {customer && (
                <b style={{ marginBottom: "30px" }}>
                  YOU SAVED: {savedMoney.toFixed(2)}
                </b>
              )}

              <button
                type="button"
                style={{ marginRight: "15px" }}
                onClick={() => checkout()}
              >
                Checkout
              </button>
              <button type="button" onClick={() => cancel()}>
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className="items">
          <h3>ITEMS</h3>

          <table style={{ marginTop: "15px" }}>
            <thead>
              <tr>
                <th>NAME</th>
                <th>QUANTITY</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>{product.name}</td>
                  <td>{product.quantity}</td>
                  <td>
                    <button type="button" onClick={() => addItem(index)}>
                      Add Item
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
