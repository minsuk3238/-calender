package com.minsuk3238.calendar;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class CalendarWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {

        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        // Capacitor sometimes prefixes keys depending on versions. We will try both just in case.
        String eventsJson = prefs.getString("widget_events", prefs.getString("CapacitorStorage_widget_events", "[]"));
        
        StringBuilder eventsText = new StringBuilder();
        try {
            JSONArray events = new JSONArray(eventsJson);
            for (int i = 0; i < Math.min(events.length(), 5); i++) {
                JSONObject event = events.getJSONObject(i);
                String title = event.getString("title");
                eventsText.append("• ").append(title).append("\n");
            }
            if (events.length() == 0) {
                eventsText.append("예정된 일정이 없습니다.");
            } else if (events.length() > 5) {
                eventsText.append("...외 ").append(events.length() - 5).append("개");
            }
        } catch (JSONException e) {
            eventsText.append("앱을 실행해 데이터를 동기화해주세요.");
        }

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
        views.setTextViewText(R.id.widget_content, eventsText.toString());

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
