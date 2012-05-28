// redis.js 0.1
// Copyright (c) 2012 Caleb Rash
// Licensed under the MIT License

var redis = {
	_: {
		stats: {},
		status: {
			ok: 'ok',
			empty: null
		},
		keys: {
			list: {},
			add: function(key) {
				this.list[key] = true;
				wafer.set('redis__keys', this.list);
			},
			remove: function(key) {
				delete this.list[key];
				wafer.set('redis__keys', this.list);
			}
		},
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
		},
		exp_list: {},
		exp_timer: {},
		unexpire: function(key) {
			clearInterval(this.exp_list[key]);
			this.exp_list[key] = null;
		}
	}
};


redis.append = function(key, value) {
	var r = wafer.get(key) + value;
	wafer.set(key, r);
	return r;
}

redis.auth = function(password) {
	return redis._.status.empty;
}

redis.bgrewriteaof = function() {
	return redis._.status.empty;
}

redis.bgsave = function() {
	return redis._.status.empty;
}

redis.bitcount = function() {
	return redis._.status.empty;
}

redis.bitop = function() {
	var op = arguments[0].toLowerCase(),
		destkey = arguments[1]
		i = 2,
		l = arguments.length,
		r = null,
		s = null;
	for(i; i<l; i++) {
		r = wafer.get(arguments[i]) || 0;
		switch(op) {
			case 'and': s = s === null ? r : s & r; break;
			case 'or':  s = s === null ? r : s | r; break;
			case 'xor': s = s === null ? r : s ^ r; break;
			case 'not': s = s === null ? r : ~r; break;
		}
	}
	wafer.set(destkey, s);
	return s;
}

redis.config = {
	get: function(parameter) {
		return this[parameter];
	},
	set: function(parameter, value) {
		this[parameter] = value;
		return redis._.status.ok;
	},
	resetstat: function() {
		redis._.stats = {};
		return redis._.status.ok;
	}
};

redis.dbsize = function() {
	var i = 0;
	for(member in redis._.keys.list) {
		i++;
	}
	return i;
};



redis.set = function(key, value) {
	redis._.unexpire(key);
	wafer.set(key, value);
	redis._.keys.add(key);
	return redis._.status.ok;
};

redis.setnx = function(key, value) {
	if(wafer.get(key) === null) {
		redis._.unexpire(key);
		wafer.set(key, value);
		redis._.keys.add(key);
	}
	return redis._.status.ok;
};

redis.get = function(key) {
	return wafer.get(key);
};

redis.del = function(key) {
	redis._.unexpire(key);
	redis._.keys.remove(key);
	return wafer.remove(key);
};

redis.expire = function(key, timeout) {
	redis._.unexpire(key);
	redis._.exp_timer[key] = timeout;
	redis._.exp_list[key] = setInterval(function() {
		redis._.exp_timer[key] -= 1;
		if(redis._.exp_timer[key] === 0) {
			redis.del(key);
			redis._.exp_list[key] = null;
			redis._.exp_timer[key] = null;
		}
	}, 1000);
	return redis._.status.ok;
};

redis.ttl = function(key) {
	if(typeof redis._.exp_list[key] == 'undefined' || redis._.exp_list[key] === null) {
		return -1;
	}
	return redis._.exp_timer[key];
};

redis.incr = function(key) {
	redis._.unexpire(key);
	var value = wafer.get(key) || 0;
	if(isNaN(value) && parseFloat(value) == NaN) {
		return null;
	}
	value = parseFloat(value) + 1;
	wafer.set(key, value);
	return value;
};

redis.rpush = function(key, value) {
	redis._.unexpire(key);
	var r = wafer.get(key) || [];
	r.push(value);
	wafer.set(key, r);
	redis._.keys.add(key);
	return r;
};

redis.lpush = function() {
	var key = arguments[0],
		i = 1,
		l = arguments.length,
		r = wafer.get(key) || [];
	redis._.unexpire(key);
	for(i; i<l; i++) {
		r.unshift(arguments[i]);
	}
	wafer.set(key, r);
	redis._.keys.add(key);
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
	return redis._.status.empty;
};

redis.lindex = function(key, index) {
	var r = wafer.get(key) || [];
	index = index == -1 ? r.length - 1 : index;
	return r[index] || redis._.status.empty;
}

redis.rpop = function(key) {
	redis._.unexpire(key);
	var r = wafer.get(key) || [];
	r = r.splice(0, r.length-1);
	wafer.set(key, r);
	redis._.keys.add(key);
	return r;
};

redis.lpop = function(key) {
	redis._.unexpire(key);
	var r = wafer.get(key) || [];
	r = r.splice(1, r.length);
	wafer.set(key, r);
	return redis._.status.ok;
};

redis.sadd = function(key, value) {
	redis._.unexpire(key);
	var r = wafer.get(key) || {};
	r[value] = true;
	wafer.set(key, r);
	redis._.keys.add(key);
	return r;
};

redis.srem = function(key, value) {
	redis._.unexpire(key);
	var r = wafer.get(key) || {};
	if(r[value] === true) {
		delete r[value];
	}
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

redis.sunion = function() {
	var unioned = {},
		l = [],
		r = {},
		argsl = arguments.length,
		i = 0;
	for(i; i<argsl; i++) {
		r = wafer.get(arguments[i]);
		for(member in r) {
			unioned[member] = true;
		}
	}
	for(member in unioned) {
		l.push(member);
	}
	return l;
};

redis.zadd = function(key, score, value) {
	redis._.unexpire(key);
	var r = wafer.get(key) || [];
	r.push({ score:score, value:value });
	wafer.set(key, r);
	redis._.keys.add(key);
	return redis._.zlist(r);
};

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
		return redis._.status.null;
	}
};




var _onload = window.onload;
window.onload = function() {
	if(typeof _onload == 'function') {
		_onload();
	}
	redis._.keys.list = wafer.get('redis__keys');
};


