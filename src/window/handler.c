#include <pebble.h>
#include "config.h"
#include "info_layer.h"
#include "clock_layer.h"

static Window *window;

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  create_clock_layer(window_layer);
  create_info_layer(window_layer);
}

static void window_unload(Window *window) {
  destroy_info_layer();
  destroy_clock_layer();
}

static void set_window(void){
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });

  window_set_background_color(window, bg_color);
  window_set_fullscreen(window, fullscreen);
  window_stack_push(window, animated);
}

void app_init(void) {
  set_window();
}

void app_deinit(void){
	window_destroy(window);
}