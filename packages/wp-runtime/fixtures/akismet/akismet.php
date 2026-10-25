<?php
/**
 * Plugin Name: Akismet Anti-Spam
 * Description: Protects your site from spam comments and contact form submissions.
 * Version: 5.2
 * Author: Automattic
 * License: GPLv2
 * Text Domain: akismet
 */

if (!defined('ABSPATH')) { exit; }

class Akismet {
    private $api_key;
    private $api_host = 'rest.akismet.com';
    private $version = '5.2';
    
    public function __construct($api_key = '') {
        $this->api_key = $api_key ?: get_option('wordpress_api_key');
    }
    
    public function check_comment($comment_data) {
        $query = http_build_query(array(
            'blog' => get_bloginfo('url'),
            'user_ip' => $comment_data['user_ip'] ?? '',
            'user_agent' => $comment_data['user_agent'] ?? '',
            'referrer' => $comment_data['referrer'] ?? '',
            'comment_type' => $comment_data['comment_type'] ?? 'comment',
            'comment_author' => $comment_data['comment_author'] ?? '',
            'comment_author_email' => $comment_data['comment_author_email'] ?? '',
            'comment_author_url' => $comment_data['comment_author_url'] ?? '',
            'comment_content' => $comment_data['comment_content'] ?? '',
        ));
        
        $response = wp_remote_post('https://' . $this->api_key . '.rest.akismet.com/1.1/comment-check', array(
            'body' => $query,
            'headers' => array('User-Agent' => 'Akismet/5.2 | WordPress/' . get_bloginfo('version')),
            'timeout' => 10,
        ));
        
        return $response;
    }
    
    public function submit_spam($comment_data) {}
    public function submit_ham($comment_data) {}
}

add_action('comment_post', function($comment_id) {
    $comment = get_comment($comment_id);
    $akismet = new Akismet();
    $akismet->check_comment(array(
        'user_ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'],
        'comment_content' => $comment->comment_content,
        'comment_author' => $comment->comment_author,
        'comment_author_email' => $comment->comment_author_email,
        'comment_author_url' => $comment->comment_author_url,
    ));
});

add_action('admin_menu', function() {
    add_submenu_page('options-general.php', 'Akismet', 'Akismet Anti-Spam', 'manage_options', 'akismet-key-config', function() {
        echo '<div class="wrap"><h1>Akismet Anti-Spam</h1><p>Configure your API key.</p></div>';
    });
});
