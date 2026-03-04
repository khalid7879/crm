<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <ul>
        <li><strong>Token for tenent:</strong>{{ $data['emailVerifyToken'] }} </li>
        @if (@$data['link'])
             <li><strong>Verify Link:</strong><a href="{{ $data['link'] }}">{{ $data['link'] }}</a> </li>
        @endif
    </ul>
</body>

</html>