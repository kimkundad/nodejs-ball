<?php
	error_reporting(E_ALL);
    ini_set('display_errors', 1);
    header("Content-Type: text/plain");

	require_once($_SERVER['DOCUMENT_ROOT'] . '/homepage/libs/config.inc');
	// require_once(ROOT_PATH . '/homepage/libs/connect.inc');
	// include_once(ROOT_PATH . '/homepage/libs/common-functions.php');

    function filterDataBallZaa($row = array(), $key = 0, $theDay = '') {
        $id = '0' . $key;
        // $time = '';
        $home = '';
        $away = '';
        $home_logo = '';
        $away_logo = '';
        $program = '';

        if (array_key_exists('main', $row)) {
            preg_match("'<div class=\"l_time\"><strong>(.*?)</strong></div>'si", $row['main'], $match);
            // $time = (array_key_exists(1, $match)) ? $match[1] : '';

            preg_match("'<div class=\"l_team1\">(.*?)</div>'si", $row['main'], $match);
			$home = (array_key_exists(1, $match)) ? $match[1] : '';
			$home = strip_tags($home);
			$home = str_replace("\n", "", $home);

            preg_match("'<div class=\"l_team2\">(.*?)</div>'si", $row['main'], $match);
			$away = (array_key_exists(1, $match)) ? $match[1] : '';
			$away = strip_tags($away);
			$away = str_replace("\n", "", $away);

            // preg_match_all("'<div class=\"l_logo\">(.*?)</div>'si", $row['main'], $match_logo);
            // $home_logo = '';
            // $away_logo = '';

            // if (array_key_exists(1, $match_logo)) {
            //     $text = $match_logo[1];
            //     if (array_key_exists(0, $text)) {
            //         $home_logo = $text[0];
            //     }
            //     if (array_key_exists(1, $text)) {
            //         $away_logo = $text[1];
            //     }
            // }

            preg_match("'<div class=\"l_program\"><strong>(.*?)</strong></div>'si", $row['main'], $match);
            $program = (array_key_exists(1, $match)) ? $match[1] : '';
        }

        $links = array();

        if (array_key_exists('link', $row)) {
            preg_match_all("'<div class=\"link_right\">(.*?)</div>'si", $row['link'], $match_link);
            if (count($match_link) != 0) {
                if (array_key_exists(1, $match_link)) {
                    if (count($match_link[1]) != 0) {
                        $link_data = $match_link[1];
                        array_shift($link_data);

                        foreach($link_data as $k => $link) {
                            preg_match_all("'<a href=\"(.*?)\" target=\"(.*?)\" rel=\"(.*?)\">(.*?)</a>'si", $link, $match);
                            $name = '';
                            if (array_key_exists(4, $match)) {
                                if (array_key_exists(0, $match[4])) {
                                    $rawName = $match[4][0];
                                    preg_match("'<strong>(.*?)</strong>'si", $rawName, $n);
                                    $name = $n[1];
                                }
                            }
                            $url = '';
                            if (array_key_exists(1, $match)) {
                                if (array_key_exists(0, $match[1])) {
                                    $url = $match[1][0];
                                }
                            }
                            
                            $links[] = array(
                                "id" => ($k+1),
                                "name" => $name,
                                "url" => $url
                            );
                        }
                    }
                }
            }
        }

        $noi = array('id' => $id,
                        'program_name' => $program,
                        'kickoff_on' => $theDay,
                        'team_home_name' => trim($home),
                        'team_away_name' => trim($away),
                        // 'team_home_logo' => $home_logo,
                        // 'team_away_logo' => $away_logo,
                        'links' => $links);

        return $noi;
    }

    $matches = file_get_contents('https://www.ballzaa.com/linkdooball.php');
    preg_match("'<body>(.*?)</body>'si", $matches, $raws);

    $datas = $raws[1];
    $arr = explode('<div class="link_rows open-close">', $datas);
    // dd($arr);

    $last_ele = end($arr);
    array_shift($arr);
    array_pop($arr);

    $contents = array();
    if (count($arr) != 0) {
        foreach($arr as $content) {
            $data = explode('<div class="desc">', $content);
            $main = $data[0];
            $link = $data[1];
            $contents[] = array('main' => $main, 'link' => $link);
        }
    }

    $all = array();

    $last_content = explode('<div class="banner-right">', $last_ele);
    $last_data = array();
    if (array_key_exists(0, $last_content)) {
        $aaa = $last_content[0];
        $last_arr = explode('<div class="desc">', $aaa);
        if (array_key_exists(0, $last_arr)) {
            $last_data['main'] = $last_arr[0];
        }
        if (array_key_exists(1, $last_arr)) {
            $last_data['link'] = $last_arr[1];
        }

        $contents[] = $last_data;
    }

    $today = Date('Y-m-d');
    $tomorrow = Date('Y-m-d', strtotime("+1 days"));
	
    if (
        (strtotime(Date("Y-m-d H:i:s")) > strtotime(Date("Y-m-d 00:00:00")))
        &&
        (strtotime(Date("Y-m-d H:i:s")) <= strtotime(Date("Y-m-d 08:00:00")))
        ) {
        $today = Date('Y-m-d', strtotime("-1 days"));
        $tomorrow = Date('Y-m-d');
    }

    $timeList = array(strtotime('08:00:00'));
    $maxTime = 0;
    $theDay = '';

    $all = array();

    if (count($contents) != 0) {
        foreach($contents as $key => $row) {
            if (array_key_exists('main', $row)) {
                preg_match("'<div class=\"l_time\"><strong>(.*?)</strong></div>'si", $row['main'], $match);
                $time = (array_key_exists(1, $match)) ? $match[1] : '';

                $thisTime = strtotime($time);
                if (count($timeList) > 0) {
                    $maxTime = max($timeList);
                }

                if ($thisTime >= $maxTime) {
                    $timeList[] = $thisTime;
                    $theDay = $today . ' ' . $time . ':00';
                } else {
                    $theDay = $tomorrow . ' ' . $time . ':00';
                }

                $all[] = filterDataBallZaa($row, ($key + 1), $theDay);
            }
        }
    }

    echo json_encode($all);
?>