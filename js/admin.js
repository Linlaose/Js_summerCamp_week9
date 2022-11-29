const orderList = document.querySelector(".js-orderList");

function init() {
  getOrderList();
};
init();

function getOrderList() {
  let data;
  const config = {
    headers: {
      "Authorization": token
    }
  }
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, config)
    .then((res) => {
      data = res.data.orders;
      renderOrderList(data);
      renderC3(data);
    })
    .catch((err) => {
      console.log(err);
    })
}
function renderOrderList(data) {
  let template = "";
  let productTemplate = "";
  let status;
  data.forEach((item) => {
    // 組合產品字串
    item.products.forEach((product) => {
      productTemplate += `<p>${product.title} * ${product.quantity}</p>`
    });

    // 定義訂單狀態顯示
    if (item.paid === false) {
      status = "未處理";
    } else if (item.paid === true) {
      status = "已處理";
    };

    template += `
      <tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          ${productTemplate}
        </td>
        <td>${renderOrderDate(item.createdAt)}</td>
        <td class="orderStatus">
          <a href="#" data-id="${item.id}">${status}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}"/>
        </td>
      </tr>
    `;
    productTemplate = "";
  })
  orderList.innerHTML = template;
}


function delOrder(productId) {
  const config = {
    headers: {
      "Authorization": token
    }
  };
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${productId}`, config)
    .then((res) => {
      console.log(res);
      getOrderList();
    })
    .catch((err) => {
      console.log(err);
    })
};
function updateOrder(productId, status) {
  const config = {
    headers: {
      "Authorization": token
    }
  };
  const data = {
    "data": {
      "id": productId,
      "paid": status
    }
  };
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, data, config)
    .then((res) => {
      getOrderList();
    })
    .catch((err) => {
      console.log(err);
    })
};
orderList.addEventListener('click', (e) => {
  e.preventDefault();
  let status;
  if (e.target.value === "刪除") {
    delOrder(e.target.getAttribute("data-id"))
  } else if (e.target.textContent === "未處理") {
    status = true;
    updateOrder(e.target.getAttribute("data-id"), status);
  } else if (e.target.textContent === "已處理") {
    status = false;
    updateOrder(e.target.getAttribute("data-id"), status);
  } else {
    return
  };
});


const clearOrdersBtn = document.querySelector(".discardAllBtn");
function clearOrders() {
  const config = {
    headers: {
      "Authorization": token
    }
  };

  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`, config)
    .then((res) => {
      getOrderList();
    })
    .catch((err) => {
      console.log(err);
    })
};

clearOrdersBtn.addEventListener('click', (e) => {
  e.preventDefault();
  clearOrders();
});

function renderOrderDate(timeStamp) {
  const date = new Date(timeStamp * 1000)
  const format = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  return format
}

function renderC3(data) {
  let arr;
  let newArr = [];
  data.forEach((item) => {
    item.products.forEach((product) => {
      arr = [product.title, (product.quantity * product.price)]
      newArr.push(arr)
    })
  })
  // data.forEach((item) => {
  //   item.products.reduce((acc, cur) => {
  // console.log(cur);
  //     acc[cur.title] = "#DACBFF";
  // console.log(acc);
  //     return acc
  //   }, {})
  // }) // 先排序，再上顏色
  function compareNumbers(a, b) {
    return b[1] - a[1];
  };
  newArr.sort(compareNumbers);
  function shiftFirstThree(arr) {
    let otherTotal = 0
    let shifted = [...arr]
    for (i = 0; i < 3; i++) {
      shifted.shift()
    };
    shifted.forEach((item) => {
      otherTotal += item[1]
    });
    return otherTotal
  };
  if (newArr.length > 3) {
    console.log(shiftFirstThree(newArr));
    newArr[3] = ['others', shiftFirstThree(newArr)]
    newArr.splice(4)
  }

  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: "pie",
      columns: newArr,
    },
    color: {
      pattern: [
        "#DACBFF",
        "#9D7FEA",
        "#5434A7",
        "#301E5f"
      ]
    }
  });
};

