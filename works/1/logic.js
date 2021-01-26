(function() {
	const l = console.log;

	const VIEW_MODS = ['Текст', 'Bin', 'Hex'];
	const baseText = new Convertable($('#base-text').text());
	const gammas = [
		new Gamma(baseText.getString().length),
		new Scrambler(
			$('#polynom').val(),
			$('#initial-value').val()
		)
	];
	let selectedGamma = 0;
	let cipherText = new Convertable('');

	cipherText.viewMode = 0;
	baseText.viewMode = 0;

	$('.view-toggler').on('click', function() {
		const applyableObject = {
			basic: baseText,
			cipher: cipherText
		}[$(this).attr('data-object')];
		const targetField = $('#' + $(this).attr('data-target'));

		switch(applyableObject.viewMode) {
			case 0: applyableObject.setString(targetField.val()); break;
			case 1: applyableObject.setBinary(targetField.val()); break;
			case 2: applyableObject.setHex(targetField.val()); break;
		}

		applyableObject.viewMode = (applyableObject.viewMode + 1) % VIEW_MODS.length;
		$(this).text(VIEW_MODS[applyableObject.viewMode]);

		const newView = [
			applyableObject.getString(),
			applyableObject.getBinary(),
			applyableObject.getHex()
		][applyableObject.viewMode];

		targetField.val(newView);
	});

	$('#gamma-type-toggler').on('change', function() {
		$('#scrambler-info').toggle(350);
		selectedGamma = !selectedGamma * 1;
	});

	const generateGamma = () => {
		const baseTextInput = $('#base-text').val();
		baseText[
			['setString', 'setBinary', 'setHex'][baseText.viewMode]
		](baseTextInput);

		gammas[1] = new Scrambler(
			$('#polynom').val(),
			$('#initial-value').val()
		);

		gammas[selectedGamma].setLength(baseText.getString().length);
		$('#gamma').val(gammas[selectedGamma].getBinary());
		$('#scrambler-period').text(gammas[1].getPeriod());

		makeResearch(gammas[selectedGamma]);
	};
	const applyCipher = () => {
		const baseTextInput = $('#base-text').val();
		baseText[
			['setString', 'setBinary', 'setHex'][baseText.viewMode]
		](baseTextInput);
		cipherText.setString(
			gammas[selectedGamma].apply(baseText.getString()).getString()
		);
		$('#cipher-text').text(cipherText.getString());
	};
	generateGamma();
	applyCipher();

	$('#gamma-generate').on('click', function() {
		generateGamma();
	});

	$('#cipher-apply').on('click', function() {
		gammas[selectedGamma].setGamma(
			$('#gamma').val()
		);
		applyCipher();
	});

	function makeResearch(gamma) {
		const set = gamma.getBinary();
		const chi2Test = () => {
			const chi2 = Statistics.chiSquaredTest(set);
			$('#chi2-value').text(chi2.chi2.toFixed(4));
			$('#chi2-critical').text(chi2.criticalValue.toFixed(4));
			$('#chi2-succeed').text({
				true: 'Да',
				false: 'Нет'
			}[chi2.isDistributionUniform.toString()]);
		};

		const balanceTest = () => {
			const balance = Statistics.balanceTest(set);
			$('#balanced-test-text').text(
				balance
					.map((range, index) => `${index + 1}(${range.length}): Разница составила ${(range.difference * 100).toFixed(0)}%, тест ${
							{true: 'успешен', false: 'провален'}[range.testSucceed]
						}`
					)
					.join('\n')
			);

			$('#balanced-succeed').text({
				true: 'Да',
				false: 'Нет'
			}[balance.testSucceed.toString()]);
		};

		const cyclicityTest = () => {
			const cyclicity = Statistics.cyclicityTest(set);
			$('#cyclicity-test-text').text(
				cyclicity
					.map((range, index) => `${index + 1}: Ожидалось ${range.expected.toFixed(4)}, фактически имеется ${range.actual.toFixed(4)}, тест ${
							{true: 'успешен', false: 'провален'}[range.testSucceed]
						}`
					)
					.join('\n')
			);

			$('#cyclicity-succeed').text({
				true: 'Да',
				false: 'Нет'
			}[cyclicity.testSucceed.toString()]);
		};

		const correlationTest = () => {
			const correlation = Statistics.correlationTest(set);
			$('#correlation-test-text').text(
				correlation
					.map((range, index) => `Сдвиг на ${index + 1}: ${range.accordances} совпадений, ${range.disaccordances} отличий, разница: ${(range.difference_percent * 100).toFixed(0)}%, тест ${
							{true: 'успешен', false: 'провален'}[range.testSucceed]
						}`
					)
					.join('\n')
			);

			$('#correlation-succeed').text({
				true: 'Да',
				false: 'Нет'
			}[correlation.testSucceed.toString()]);
		};

		chi2Test();
		balanceTest();
		cyclicityTest();
		correlationTest();
	}
})();