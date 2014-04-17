#include <pebble.h>
#include "config.h"

static TextLayer *clock_layer;

// Makes time from seconds
static void handle_second_tick(struct tm* tick_time, TimeUnits units_changed) {
  static char time_text[] = "00:00:00";
  strftime(time_text, sizeof(time_text), "%T", tick_time);
  text_layer_set_text(clock_layer, time_text);
}

static void set_layer_up(Layer *window_layer){
  GRect bounds = layer_get_bounds(window_layer);
  clock_layer = text_layer_create((GRect) { .origin = { 0, 10 }, .size = { bounds.size.w, 35 } });
  text_layer_set_text_alignment(clock_layer, GTextAlignmentCenter);
  text_layer_set_text_color(clock_layer, txt_color);
  text_layer_set_background_color(clock_layer, bg_color);
  text_layer_set_font(clock_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
}

static void set_clock_layer(Layer *window_layer){
	set_layer_up(window_layer);

  time_t now = time(NULL);
  struct tm *current_time = localtime(&now);
  handle_second_tick(current_time, SECOND_UNIT);
  tick_timer_service_subscribe(SECOND_UNIT, &handle_second_tick);


  layer_add_child(window_layer, text_layer_get_layer(clock_layer));
}

void create_clock_layer(Layer *window_layer){
	set_clock_layer(window_layer);
}

// LAYER DESTROY //
void destroy_clock_layer(void){
  text_layer_destroy(clock_layer);
}