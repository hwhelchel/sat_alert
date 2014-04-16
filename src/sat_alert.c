#include <pebble.h>
#include "app.h"

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

static void handle_out_sent(DictionaryIterator *sent, void *context) {
  timer = app_timer_register(polling_frequency, ask_for_iss_location, NULL);
}

static void handle_out_failed(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  timer = app_timer_register(polling_frequency, ask_for_iss_location, NULL);
}

static void handle_in_received(DictionaryIterator *sent, void *context){
  Tuple *test = dict_find(sent, 0);
  static char text[140];
  strncpy(text, test->value->cstring, 140);
  set_info_text(text);
  vibes_double_pulse();
}

static void app_message_init(void){
  app_message_register_outbox_sent(handle_out_sent);
  app_message_register_outbox_failed(handle_out_failed);
  app_message_register_inbox_received(handle_in_received);

  const uint32_t inbound_size = 140;
  const uint32_t outbound_size = 64;
  app_message_open(inbound_size, outbound_size);

}

static void init(void) {
  app_init();
  poll_phone();
  app_message_init();
  polling_frequency = 60000; // 60 seconds
}

static void deinit(void) {
  //window_destroy(window);
  app_deinit();
  ask_for_iss_location(NULL);
}

int main(void) {
  init();

  //APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  app_event_loop();
  deinit();
}
