#include <pebble.h>
#include "app.h"

AppTimer *timer;
uint32_t polling_frequency;

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

void message_handler_init(void){
  app_message_register_outbox_sent(handle_out_sent);
  app_message_register_outbox_failed(handle_out_failed);
  app_message_register_inbox_received(handle_in_received);

  const uint32_t inbound_size = 140;
  const uint32_t outbound_size = 64;
  app_message_open(inbound_size, outbound_size);

  ask_for_iss_location(NULL);

  polling_frequency = 60000; // 60 seconds
  poll_phone();


}