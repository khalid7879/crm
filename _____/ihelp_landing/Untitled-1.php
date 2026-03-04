<?php


    function call($params, $phone) {
         $phone = $_POST['phone'];
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => "http://115.127.84.90:8001/api/business-partner/history?$params=" . urlencode($phone),
            // CURLOPT_URL => "http://115.127.84.90:8001/api/business-partner/history",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => array(
                'AccessKey: 395853453A544D40444738264E3D753B506E5761613C61743B4A6E355F613944533C5940403356524E45454844'
            ),
        ));

        $response = curl_exec($curl);

        if (curl_errno($curl)) {
            echo json_encode(['error' => curl_error($curl)]);
        } else {
            header('Content-Type: application/json');
            echo $response;
        }

        curl_close($curl);
    }

    // ✅ Call the function here
    call("phone", $phone);



?>
