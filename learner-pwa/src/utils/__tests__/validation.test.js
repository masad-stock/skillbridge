import { sanitizeString, sanitizeObject, isValidEmail, validatePassword } from '../validation';

describe('Validation Utils', () => {
    describe('sanitizeString', () => {
        it('should remove HTML tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            const result = sanitizeString(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('Hello');
        });

        it('should trim whitespace', () => {
            const input = '  Hello World  ';
            const result = sanitizeString(input);
            expect(result).toBe('Hello World');
        });

        it('should handle null and undefined', () => {
            expect(sanitizeString(null)).toBe(null);
            expect(sanitizeString(undefined)).toBe(undefined);
        });
    });

    describe('sanitizeObject', () => {
        it('should sanitize all string values in object', () => {
            const obj = {
                name: '<script>alert("xss")</script>John',
                email: '  test@test.com  ',
                age: 25
            };

            const result = sanitizeObject(obj);

            expect(result.name).not.toContain('<script>');
            expect(result.email).toBe('test@test.com');
            expect(result.age).toBe(25);
        });

        it('should handle nested objects', () => {
            const obj = {
                user: {
                    name: '<b>John</b>',
                    profile: {
                        bio: '<script>xss</script>Hello'
                    }
                }
            };

            const result = sanitizeObject(obj);

            expect(result.user.name).not.toContain('<b>');
            expect(result.user.profile.bio).not.toContain('<script>');
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct email formats', () => {
            expect(isValidEmail('test@test.com')).toBe(true);
            expect(isValidEmail('user.name@example.co.uk')).toBe(true);
            expect(isValidEmail('user+tag@domain.com')).toBe(true);
        });

        it('should reject invalid email formats', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('invalid@')).toBe(false);
            expect(isValidEmail('@invalid.com')).toBe(false);
            expect(isValidEmail('invalid@.com')).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should validate strong passwords', () => {
            const result1 = validatePassword('StrongPass123!');
            const result2 = validatePassword('MyP@ssw0rd');
            expect(result1.isValid).toBe(true);
            expect(result2.isValid).toBe(true);
        });

        it('should reject weak passwords', () => {
            const result1 = validatePassword('weak');
            const result2 = validatePassword('12345');
            const result3 = validatePassword('password');
            expect(result1.isValid).toBe(false);
            expect(result2.isValid).toBe(false);
            expect(result3.isValid).toBe(false);
        });
    });
});
