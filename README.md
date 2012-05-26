#Redis.js

Redis.js is an experimental port of Redis to Javascript. It was created to expand key-value storage in Javascript and to highlight the flexibility of Wafer.js.

##Dependencies
Redis.js relies on Wafer.js which can be found here:
https://github.com/calebrash/Wafer

##Usage

Redis.js tries to adhere to format of Redis as closely as possible.

###Examples
```javascript
// SET and GET
redis.set('test', 't1');
redis.get('test');   // => t1

// Lists
redis.lpush('test', 't1');   // => [ t1 ]
redis.lpush('test', 't2');   // => [ t1, t2 ]
redis.rpop('test');          // => [ t2 ]
```

Redis.js also provides a method to use Redis-style commands directly.

```javascript
redis.cmd('SET test "t2"');
```

##Supported commands

The following list is the current list of Redis commands supported by Redis.js. These are intended to function just as their Redis counterparts, so for detailed usage, view the Redis docs:
http://redis.io/documentation

- set(key, value)
- setnx(key, value)
- get(key)
- del(key)
- incr(key)
- rpush(key, value)
- lpush(key, value)
- lrange(key, start, end)
- llen(key)
- rpop(key)
- lpop(key)
- sadd(key, value)
- srem(key, value)
- sismember(key, value)
- smembers(key)
- sunion(key1, key2)
- zadd(key, score, value)
- zrange(key, start, end)
- cmd(command)

