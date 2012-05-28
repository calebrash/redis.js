/**** Jasmine unit testing for Redis.js commands ****/

/****
 *		Test Format:
 ****
 *		COMMAND Argument Argument ...
 *		Short description of command, its functionality, and expected results.
 *		[ test ]
 ****/


/****
 *		SET key value
 *		Stores 'value' as key
 ****/

 describe('SET key value', function() {
 	it('Sets the key and checks that it has been set.', function() {
 		redis.set('test:set', 'f944b78f711dd68c99c24d4a10c6618ec9ca7664');
 		expect(redis.get('test:set')).toBe('f944b78f711dd68c99c24d4a10c6618ec9ca7664');
 	});
 });

/****
 *		GET key
 *		Returns 'value' that is stored as key
 ****/

 describe('GET key', function() {
 	it('Sets a key and checks that it can be retreived.', function() {
 		redis.set('test:get', '2ee4217c9ffcd60d2847e97648f3c56db71436cd');
 		expect(redis.get('test:get')).toBe('2ee4217c9ffcd60d2847e97648f3c56db71436cd');
 	});
 });


