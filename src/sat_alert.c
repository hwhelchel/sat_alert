#include <pebble.h>

static Window *window;
static TextLayer *info_layer;
static TextLayer *clock_layer;
static AppTimer *timer;
static uint32_t polling_frequency;

static void ask_for_iss_location(void *data) {
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  Tuplet value = TupletInteger(1, 1);
  dict_write_tuplet(iter, &value);
  app_message_outbox_send();
}

static void poll_phone(void){
  timer = app_timer_register(polling_frequency, ask_for_iss_location, NULL);
}

static void out_sent_handler(DictionaryIterator *sent, void *context) {
  timer = app_timer_register(polling_frequency, ask_for_iss_location, NULL);
}

static void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  timer = app_timer_register(polling_frequency, ask_for_iss_location, NULL);
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
  text_layer_set_font(clock_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));

  time_t now = time(NULL);
  struct tm *current_time = localtime(&now);
  handle_second_tick(current_time, SECOND_UNIT);
  tick_timer_service_subscribe(SECOND_UNIT, &handle_second_tick);


  layer_add_child(window_layer, text_layer_get_layer(clock_layer));
}

static void set_info_text(char text[]){
  text_layer_set_text(info_layer, text);
}

static void set_info_layer(Layer *window_layer){
  info_layer = text_layer_create(GRect(9, 74, 144-10 /* width */, 168-70 /* height */));
  text_layer_set_text_color(info_layer, GColorBlack);
  text_layer_set_text_alignment(info_layer, GTextAlignmentCenter);
  text_layer_set_background_color(info_layer, GColorWhite);
  text_layer_set_font(info_layer, fonts_get_system_font(FONT_KEY_GOTHIC_14));

  static char text[] = "Matthew stinks, he did shower though, but well... Donate Shower Gel to @TheRealGlenn";
  set_info_text(text);

  layer_add_child(window_layer, text_layer_get_layer(info_layer));
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  set_clock_layer(window_layer);
  set_info_layer(window_layer);
  poll_phone();
}

static void window_unload(Window *window) {
  text_layer_destroy(info_layer);
  text_layer_destroy(clock_layer);
}

static void app_message_init(void){
  app_message_register_outbox_sent(out_sent_handler);
  app_message_register_outbox_failed(out_failed_handler);

  const uint32_t inbound_size = 64;
  const uint32_t outbound_size = 64;
  app_message_open(inbound_size, outbound_size);

}

static void init(void) {
  window = window_create();
  app_message_init();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  polling_frequency = 30000; // 30 seconds
  window_stack_push(window, animated);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  app_event_loop();
  deinit();
}
