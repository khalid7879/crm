<!DOCTYPE html>
<html data-theme="light">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">


    @vite('resources/js/app.jsx')
    @inertiaHead
    @routes
</head>

<body class="">
    @inertia
</body>

</html>
