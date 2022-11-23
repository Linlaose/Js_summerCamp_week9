const productList = document.querySelector(".productWrap");

function init() {
  getProductList();
  getCartList();
};
init();

function getProductList() {
  let template = "";
  let data;
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((res) => {
      data = res.data.products;
      data.forEach((item) => {
        template += `
          <li class="productCard">
            <h4 class="productType">新品</h4>
            <img
              src="${item.images}"
              alt="">
            <a href="#" class="js-addCart"  id="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
          </li>
        `
      })
      productList.innerHTML = template;
    })
    .catch((err) => {
      console.log(err);
    })
}

function getCartList() {
  let data;
  let template = "";
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res) => {
      data = res.data.carts;
      data.forEach((item) => {
        template += `
          <tr>
            <td>
              <div class="cardItem-title">
                <img src="${item.product.images}" alt="" />
                <p>${item.product.title}</p>
              </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${item.quantity * item.product.price}</td>
            <td class="discardBtn">
              <a href="#" class="material-icons"> clear </a>
            </td>
          </tr>
        `;
      })
      shoppingCart.innerHTML = template;
    })
    .catch((err) => {
      console.log(err);
    })
}


function addToCart(productId) {
  const data = {
    "data": {
      "productId": productId,
      "quantity": 5
    }
  };
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, data)
    .then((res) => {
      console.log(res);
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

const shoppingCart = document.querySelector(".shoppingCart-tableList");