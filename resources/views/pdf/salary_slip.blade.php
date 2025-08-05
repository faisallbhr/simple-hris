<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Salary Slip</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            padding: 8px;
            border: 1px solid #ccc;
            text-align: left;
        }
    </style>
</head>

<body>
    <h2>Salary Slip</h2>
    <p><strong>Employee ID:</strong> {{ $slip->employee_id }}</p>
    <p><strong>Employee Name:</strong> {{ $employeeName }}</p>
    <p><strong>Period:</strong> {{ $slip->slip_data['period']['start'] }} to {{ $slip->slip_data['period']['end'] }}</p>

    <table>
        <tr>
            <th>Description</th>
            <th>Amount (Rp)</th>
        </tr>
        <tr>
            <td>Base Salary</td>
            <td>{{ number_format($slip->slip_data['base_salary'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Bonus</td>
            <td>{{ number_format($slip->slip_data['bonus'] ?? 0, 0, ',', '.') }}</td>
        </tr>

        @foreach ($slip->slip_data['allowances'] ?? [] as $name => $value)
            <tr>
                <td>Allowance - {{ $name }}</td>
                <td>{{ number_format($value, 0, ',', '.') }}</td>
            </tr>
        @endforeach

        @foreach ($slip->slip_data['deductions'] ?? [] as $name => $value)
            <tr>
                <td>Deduction - {{ $name }}</td>
                <td>-{{ number_format($value, 0, ',', '.') }}</td>
            </tr>
        @endforeach

        <tr>
            <th>Net Salary</th>
            <th>{{ number_format($slip->slip_data['net_salary'], 0, ',', '.') }}</th>
        </tr>
    </table>
</body>

</html>
