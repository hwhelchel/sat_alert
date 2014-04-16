#include <pebble.h>

static Window *window;
static TextLayer *info_layer;
static TextLayer *clock_layer;

void set_info_text(char text[]){
  text_layer_set_text(info_layer, text);
  GSize max_size = text_layer_get_content_size(info_layer);
  max_size.w = max_size.w + 5;
  max_size.h = max_size.h + 5;
  text_layer_set_size(info_layer, max_size);
  text_layer_set_background_color(info_layer, GColorWhite);
}

// Makes time from seconds
static void handle_second_tick(struct tm* tick_time, TimeUnits units_changed) {

  static char time_text[] = "00:00:00"; // Needs to be static because it's used by the system later.


  strftime(time_text, sizeof(time_text), "%T", tick_time);
  text_layer_set_text(clock_layer, time_text);
}


static void set_clock_layer(Layer *window_layer){
  GRect bounds = layer_get_bounds(window_layer);

  clock_layer = text_layer_create((GRect) { .origin = { 0, 10 }, .size = { bounds.size.w, 35 } });
  text_layer_set_text_alignment(clock_layer, GTextAlignmentCenter);
  text_layer_set_text_color(clock_layer, GColorWhite);
  text_layer_set_background_color(clock_layer, GColorBlack);
  text_layer_set_font(clock_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));

  time_t now = time(NULL);
  struct tm *current_time = localtime(&now);
  handle_second_tick(current_time, SECOND_UNIT);
  tick_timer_service_subscribe(SECOND_UNIT, &handle_second_tick);


  layer_add_child(window_layer, text_layer_get_layer(clock_layer));
}



static void set_info_layer(Layer *window_layer){
  GRect bounds = layer_get_frame(window_layer);
  bounds = GRect(4, 50, bounds.size.w-8 , 2000);
  info_layer = text_layer_create(bounds);
  text_layer_set_text_color(info_layer, GColorBlack);
  text_layer_set_background_color(info_layer, GColorBlack);
  text_layer_set_text_alignment(info_layer, GTextAlignmentCenter);
  text_layer_set_font(info_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24));


  layer_add_child(window_layer, text_layer_get_layer(info_layer));
}


static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  set_clock_layer(window_layer);
  set_info_layer(window_layer);
}

static void window_unload(Window *window) {
  text_layer_destroy(info_layer);
  text_layer_destroy(clock_layer);
}

void app_init(void) {
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_set_background_color(window, GColorBlack);
  window_set_fullscreen(window, true);
  const bool animated = true;
  window_stack_push(window, animated);
}

void app_deinit(void){
	window_destroy(window);
}