const result = regexifyString({
  input: data.content,
  pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
  decorator(match, index) {
    const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!;
    if (arr) {
      return (
        <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
          @{arr[1]}
        </Link>
      );
    }
    return <br key={index} />;
  },
});
