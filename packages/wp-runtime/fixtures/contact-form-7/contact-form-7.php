<?php
/**
 * Plugin Name: Contact Form 7
 * Description: Just another contact form plugin. Simple but flexible.
 * Version: 5.8.7
 * Author: Takayuki Miyoshi
 * License: GPLv2
 * Text Domain: contact-form-7
 */

if (!defined('ABSPATH')) {
    exit;
}

class WPCF7_ContactForm {
    public $id;
    public $title;
    public $form;
    
    public function __construct($id = 0) {
        if ($id) {
            $this->id = $id;
            $this->load();
        }
    }
    
    public function load() {}
    
    public function render() {
        echo '<form action="' . esc_url(admin_url('admin-post.php')) . '" method="post" class="wpcf7-form">';
        echo '<input type="hidden" name="action" value="wpcf7_submit">';
        echo '<input type="hidden" name="wpcf7_unit_tag" value="wpcf7-f' . $this->id . '-p' . get_the_ID() . '-o1">';
        echo $this->form;
        echo '<input type="submit" value="' . esc_attr(__('Submit', 'contact-form-7')) . '">';
        echo '</form>';
    }
}

function wpcf7_enqueue_scripts() {
    wp_enqueue_script('contact-form-7', plugins_url('contact-form-7/includes/js/scripts.js'), array('jquery'), '5.8.7', true);
    wp_localize_script('contact-form-7', 'wpcf7', array(
        'apiUrl' => rest_url('contact-form-7/v1'),
        'apiNonce' => wp_create_nonce('wp_rest'),
    ));
}
add_action('wp_enqueue_scripts', 'wpcf7_enqueue_scripts');

add_action('admin_post_nopriv_wpcf7_submit', 'wpcf7_submit_handler');
add_action('admin_post_wpcf7_submit', 'wpcf7_submit_handler');

function wpcf7_submit_handler() {
    check_ajax_referer('wp_rest', 'nonce');
    $submission = WPCF7_Submission::get_instance();
    if ($submission) {
        $result = $submission->process();
        wp_send_json($result);
    }
}

class WPCF7_Submission {
    private static $instance = null;
    public static function get_instance() {
        if (self::$instance === null) { self::$instance = new self(); }
        return self::$instance;
    }
    public function process() {
        return array('into' => '#wpcf7-f123-p456-o1', 'status' => 'mail_sent', 'message' => 'Thank you for your message. It has been sent.', 'posted_data_hash' => '');
    }
}

add_action('init', function() {
    register_post_type('wpcf7_contact_form', array(
        'labels' => array('name' => 'Contact Forms', 'singular_name' => 'Contact Form'),
        'public' => false, 'show_ui' => true, 'capability_type' => 'wpcf7_contact_form',
        'map_meta_cap' => true, 'supports' => array('title'),
    ));
});

add_action('admin_menu', function() {
    add_menu_page('Contact Forms', 'Contact', 'manage_options', 'wpcf7', 'wpcf7_admin_manage_page', 'dashicons-email-alt', 25);
});

function wpcf7_admin_manage_page() {
    echo '<div class="wrap"><h1>Contact Forms</h1></div>';
}
