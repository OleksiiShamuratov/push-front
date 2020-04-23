<?php
header('Content-type:application/json;charset=utf-8');
$content = json_decode(file_get_contents('php://input'), true);
if(!isset($content['id']) || empty($content['id']))
{
    print_r(json_encode([
        'status' => true,
        'entity' => [
            'id' => $content['id'],
            'token' => $content['token'],
        ]
    ]));
}
else {
    print_r(json_encode([
        'status' => false,
        'message'   => 'Empty body'
    ]));
}
die();