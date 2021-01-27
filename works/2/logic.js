console.log(`---=========---`);
console.log(`Preparing`);
const str = 'Hello World!';
const strBits = Converter.strToBin(str);
console.log(`${str}: ${strBits}`);
const key = Gamma.getScramblerGamma(32).gamma;
console.log(`Key: ${key}`);

console.log(`---=========---`);
console.log(`Ciphering`);
const ciphers = [0, 1, 2, 3]
	.map(vfCase => FeistelsNetwork.apply(strBits, key, vfCase));
ciphers.forEach((cipher, index) => 
		console.log(`Case #${index}: ${Converter.binToStr(cipher)} (${cipher})`)
	);

console.log(`---=========---`);
console.log(`Deciphering`);
const deciphers = [0, 1, 2, 3]
	.map(vfCase => FeistelsNetwork.apply(ciphers[vfCase], key, vfCase, false));
deciphers.forEach((decipher, index) => 
	console.log(`Case #${index}: ${Converter.binToStr(decipher)} (${decipher})`)
);