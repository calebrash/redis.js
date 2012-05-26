// redis.js 0.1
// Copyright (c) 2012 Caleb Rash
// Licensed under the MIT License

var redis = {
	_: {
		zlist: function(list, reverse) {
			reverse = reverse || false;
			var r = [],
				l = list.length,
				i = 0;
			if(reverse) {
				list = this.zrsort(list);
			} else {
				list = this.zsort(list);
			}
			for(i; i<l; i++) {
				r.push(list[i].value);
			}
			return r;
		},
		zsort: function(list) {
			var l = list.length,
				i = 0,
				tmp;
			if(l <= 1) {
				return list;
			}
			while(l>1) {
				for(i; i<l-1; i++) {
					if(list[i].score > list[i+1].score) {
						tmp = list[i];
						list[i] = list[i+1];
						list[i+1] = tmp;
					} else {
						if(list[i].score == list[i+1].score && list[i].value > list[i+1].value) {
							tmp = list[i];
							list[i] = list[i+1];
							list[i+1] = tmp;
						}
					}
				}
				i = 0;
				l--;
			}
			return list;
		},
		zrsort: function(list) {
			console.log('zrsort');
			return list;
		}
	}
};

redis.set = function(key, value) {
	wafer.set(key, value);
};

redis.setnx = function(key, value) {
	if(wafer.get(key) === null) {
		wafer.set(key, value);
	}
};

redis.get = function(key) {
	return wafer.get(key);
};

redis.del = function(key) {
	return wafer.remove(key);
};

redis.incr = function(key) {
	var value = wafer.get(key) || 0;
	if(isNaN(value) && parseFloat(value) == NaN) {
		return null;
	}
	value = parseFloat(value) + 1;
	wafer.set(key, value);
	return value;
};

redis.rpush = function(key, value) {
	var r = wafer.get(key) || [];
	r.push(value);
	wafer.set(key, r);
	return r;
};

redis.lpush = function(key, value) {
	var r = wafer.get(key) || [];
	r.unshift(value);
	wafer.set(key, r);
	return r;
};

redis.lrange = function(key, start, end) {
	var r = wafer.get(key) || [];
	end = end === -1 ? r.length : end;
	return r.splice(start, end);
};

redis.llen = function(key) {
	var r = wafer.get(key) || [];
	if(typeof r === 'array' || typeof r === 'object') {
		return r.length;
	}
	return null;
};

redis.rpop = function(key) {
	var r = wafer.get(key) || [];
	r = r.splice(0, r.length-1);
	wafer.set(key, '');
	wafer.set(key, r);
	return r;
};

redis.lpop = function(key) {
	var r = wafer.get(key) || [];
	r = r.splice(1, r.length);
	wafer.set(key, '');
	wafer.set(key, r);
};

redis.sadd = function(key, value) {
	var r = wafer.get(key) || {};
	r[value] = true;
	wafer.set(key, '');
	wafer.set(key, r);
	return r;
};

redis.srem = function(key, value) {
	var r = wafer.get(key) || {};
	if(r[value] === true) {
		delete r[value];
	}
	wafer.set(key, '');
	wafer.set(key, r);
	return r;
};

redis.sismember = function(key, value) {
	var r = wafer.get(key) || {};
	return r[value] === true;
};

redis.smembers = function(key) {
	var r = wafer.get(key),
		l = [];
	for(member in r) {
		l.push(member);
	}
	return l;
};

redis.sunion = function(key1, key2) {
	var unioned = {},
		l = [],
		r1 = wafer.get(key1) || {},
		r2 = wafer.get(key2) || {};
	for(member in r1) {
		unioned[member] = true;
	}
	for(member in r2) {
		unioned[member] = true;
	}
	for(member in unioned) {
		l.push(member);
	}
	return l;
};

redis.zadd = function(key, score, value) {
	var r = wafer.get(key) || [];
	r.push({ score:score, value:value });
	wafer.set(key, '');
	wafer.set(key, r);
	return redis._.zlist(r);
};

/*
redis.zlist = function(key) {
	var r = wafer.get(key) || [];
	return redis._.zlist(r);
}
*/

redis.zrange = function(key, start, end) {
	var r = redis._.zlist(wafer.get(key)) || [];
	end = end === -1 ? r.length : end;
	return r.splice(start, end);
};





redis.cmd = function(command) {
	var cmd = command.split(' ');
	var func = cmd[0].toLowerCase();
	var key = cmd[1];
	var value = cmd.splice(2, cmd.length).join(' ');
	if(value[0] == '"' || value[0] == "'") {
		value = value.substring(1, value.length-1);
	}
	try {
		return redis[func](key, value);
	} catch(e) {
		throw new Error('Redis command could not be parsed.');
	}
};
