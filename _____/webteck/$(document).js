 $(document).ready(function() {
    var phone = '<?php echo $phone; ?>';
    alert(phone);

    $.ajax({
      method: 'POST',
      url: "api.php",
      data: {
        'phone': phone,
        'type': "CALL_FUNCTION"
      },
      dataType: 'json',
      success: function(result) {
        const customer = result.Data.CustomerInfo;
        // console.log(customer);
        $("#customer_id").val(customer.CustomerId);
        $("#customer_name").val(customer.CustomerName);
        $("#contact_number").val(customer.Mobile);
        $("#home_address").val(customer.HomeAddress);
        $("#start_date").val(customer.MembershipStartDate);
        $("#expiry_date").val(customer.MembershipEndDate);
        $("#age").val(customer.age);
        $("#card_type").val(customer.CardType);
        const LastOrders = result.Data.LastOrders;
        if (LastOrders.length > 0) {
          const tableBody = document.getElementById('orders-table-body');
          tableBody.innerHTML = ''; // Clear existing rows

          LastOrders.forEach(order => {
            const row = document.createElement('tr');

            // Replace these keys with the actual keys from your API response
            row.innerHTML = `
      <td>${order.OrderDate}</td>
      <td>${order.ItemName}</td>
      <td>${order.Quantity}</td>
      <td>${order.DeliveryDate}</td>
      <td>${order.DeliveryStatus}</td>
      <td>${order.SalesChannel}</td>
      <td>${order.DiscPrcnt}</td>
      <td>${order.OrderTotal}</td>
    `;

            tableBody.appendChild(row);
          });
        }
        const LastServices = result.Data.LastServices;
       if (LastServices.length > 0) {
          const tableBody = document.getElementById('services-table-body');
          tableBody.innerHTML = ''; // Clear existing rows

          LastServices.forEach(services => {
            const row = document.createElement('tr');

            // Replace these keys with the actual keys from your API response
            row.innerHTML = `
      <td>${''}</td>
      <td>${''}</td>
      <td>${services.OrderDate}</td>
      <td>${''}</td>
      <td>${services.TotalSessions}</td>
      <td>${services.GainedSessions}</td>
      <td>${services.PendingSessions}</td>
      <td>${''}</td>
    `;

            tableBody.appendChild(row);
          });
        }
      }
    });

  });