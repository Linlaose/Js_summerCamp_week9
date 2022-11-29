const productList = document.querySelector(".productWrap");

let cartData = [];

function init() {
  getProductList();
  getCartList();
};
init();

function thousandSeparator(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function getProductList() {
  let str = "";
  let data;
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((res) => {
      data = res.data.products;
      data.forEach((item) => {
        str += combinedProduct(item);
      });
      renderProductList(str);
    })
    .catch((err) => {
      console.log(err);
    })
};
function combinedProduct(item) {
  console.log(item.origin_price);
  let template = "";
  template += `
          <li class="productCard">
            <h4 class="productType">新品</h4>
            <img
              src="${item.images}"
              alt="">
            <a href="#" class="js-addCart"  id="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${thousandSeparator(item.origin_price)}</del>
            <p class="nowPrice">NT$${thousandSeparator(item.price)}</p>
          </li>
        `;
  return template
};
function renderProductList(product) {
  productList.innerHTML = product;
};
function renderCartList(cartData) {
  let bodyTemplate = "";
  let totalPrice = 0;
  cartData.forEach((item) => {
    const productPrice = item.quantity * item.product.price;
    bodyTemplate += `
          <tr>
            <td>
              <div class="cardItem-title">
                <img src="${item.product.images}" alt="" />
                <p>${item.product.title}</p>
              </div>
            </td>
            <td>NT$${thousandSeparator(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${thousandSeparator(productPrice)}</td>
            <td class="discardBtn">
              <a href="#" data-id=${item.id} class="material-icons"> clear </a>
            </td>
          </tr>
        `;
    totalPrice += productPrice
  });

  shoppingCart.innerHTML = bodyTemplate;
  shoppingCartTotal.innerHTML = `${thousandSeparator(totalPrice)} 元`;
}

const shoppingCart = document.querySelector(".shoppingCart-tableList");
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res) => {
      cartData = res.data.carts;
      renderCartList(cartData);
    })
    .catch((err) => {
      console.log(err);
    })
};

const productSelect = document.querySelector(".productSelect");

function selectProduct(selectedItem) {
  let data;
  let str = "";
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((res) => {
      data = res.data.products;
      data.forEach((item) => {
        if (selectedItem === item.category) {
          str += combinedProduct(item);
        } else if (selectedItem === "全部") {
          getProductList();
        }
      })
      renderProductList(str);
    })
    .catch((err) => {
      console.log(err);
    })
}

productSelect.addEventListener('change', (e) => {
  selectProduct(e.target.value);
})

function addToCart(productId) {
  const data = {
    "data": {
      "productId": productId,
      "quantity": 1
    }
  };
  if (cartData.length === 0) {
    data.data.quantity = 1
  }
  cartData.forEach((item) => {
    if (productId === item.product.id) {
      data.data.quantity = (item.quantity += 1)
    }
  })
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, data)
    .then((res) => {
      getCartList();
    })
    .catch((err) => {
      console.log(err);
    })
}

productList.addEventListener('click', (e) => {
  e.preventDefault();
  if (e.target.textContent === "加入購物車") {
    const productId = e.target.getAttribute('data-id')
    addToCart(productId);
  }
})

function delCartItem(productId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${productId}`)
    .then((res) => {
      getCartList();
    })
    .catch((err) => {
      console.log(err);
    })
};
shoppingCart.addEventListener('click', (e) => {
  e.preventDefault();
  const productId = e.target.getAttribute("data-id")
  if (e.target.getAttribute("class") !== "material-icons") {
    return
  } else {
    delCartItem(productId)
  }
})

const shoppingCartTotal = document.querySelector(".js-total");
const shoppingCartFoot = document.querySelector(".shoppingCart-tablePrice");
const deleteAllBtn = document.querySelector(".discardAllBtn");

function delAllCart() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res) => {
      alert(res.data.message);
      getCartList();
    })
    .catch((err) => {
      alert(err.response.data.message);
    })
};

shoppingCartFoot.addEventListener('click', (e) => {
  e.preventDefault();
  if (e.target.getAttribute("class") !== "discardAllBtn") {
    return
  } else {
    delAllCart();
  }
})


const submitOrderBtn = document.querySelector(".orderInfo-btn");
const orderForm = document.querySelector(".orderInfo-form");

function submitOrder(obj) {
  const data = {
    "data": {
      "user": {
        "name": obj.name,
        "tel": obj.phone,
        "email": obj.email,
        "address": obj.address,
        "payment": obj.tradeWay
      }
    }
  }
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, data)
    .then((res) => {
      alert("訂單送出成功");
      getCartList();
    })
    .catch((err) => {
      console.log(err);
    })
};

submitOrderBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const customer = {
    "name": document.querySelector("#customerName").value,
    "phone": document.querySelector("#customerPhone").value,
    "email": document.querySelector("#customerEmail").value,
    "address": document.querySelector("#customerAddress").value,
    "tradeWay": document.querySelector("#tradeWay").value
  }
  if (cartData.length === 0) {
    alert("請增加商品進購物車哦");
    return
  } else {
    if (customer.name === "" || customer.phone === "" || customer.email === "" || customer.address === "") {
      alert("請確實填寫資料");
      return
    } else {
      submitOrder(customer);
      orderForm.reset();
    };
  };
});