package com.astromatch.api.config;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class SlidingWindowRateLimiter {

	private final ConcurrentHashMap<String, List<Long>> hits = new ConcurrentHashMap<>();

	/**
	 * @return true if request is allowed
	 */
	public synchronized boolean allow(String key, int maxEvents, long windowMillis) {
		long now = System.currentTimeMillis();
		List<Long> ts = hits.computeIfAbsent(key, k -> new ArrayList<>());
		ts.removeIf(t -> t < now - windowMillis);
		if (ts.size() >= maxEvents) {
			return false;
		}
		ts.add(now);
		return true;
	}
}
